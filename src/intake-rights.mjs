import postgres from 'postgres';

function clean(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export function validateRightsLookup({ requestId, contact } = {}) {
  const issues = [];
  const id = clean(requestId, 80);
  const c = clean(contact, 320).toLowerCase();
  if (!/^[A-Za-z0-9-]{8,80}$/.test(id)) issues.push('A valid requestId is required.');
  if (!c || (!/^\S+@\S+\.\S+$/.test(c) && !/^\+?[0-9 ()-]{7,40}$/.test(c))) issues.push('A matching email or phone contact is required.');
  return { issues, requestId: id, contact: c };
}

export function createIntakeRightsService({
  readConnectionString = process.env.INTAKE_DATABASE_URL,
  maintenanceConnectionString = process.env.INTAKE_MAINTENANCE_DATABASE_URL
} = {}) {
  if (!readConnectionString) return null;
  const read = postgres(readConnectionString, { max: 1, idle_timeout: 20, connect_timeout: 8, prepare: true });
  const maintenance = maintenanceConnectionString
    ? postgres(maintenanceConnectionString, { max: 1, idle_timeout: 20, connect_timeout: 8, prepare: true })
    : null;

  async function findVerifiedSubject(input) {
    const validated = validateRightsLookup(input);
    if (validated.issues.length) throw new Error(validated.issues.join(' '));
    const rows = await read`
      SELECT request_id, state, route, created_at, updated_at,
             contact_email, contact_phone, service_area, room_type, furniture_type,
             width_mm, height_mm, depth_mm,
             obstacles, access_constraints, material_preferences, finish_preferences,
             missing_information, risk_flags, budget_range, target_date,
             delivery_required, fitting_required, customer_notes,
             consent_version, privacy_notice_version, consent_accepted_at,
             retention_delete_after
      FROM dropi_ops.custom_intake_requests
      WHERE request_id = ${validated.requestId}
        AND (
          lower(coalesce(contact_email, '')) = ${validated.contact}
          OR regexp_replace(coalesce(contact_phone, ''), '[^0-9+]', '', 'g') = regexp_replace(${validated.contact}, '[^0-9+]', '', 'g')
        )
      LIMIT 1
    `;
    return rows[0] || null;
  }

  return {
    async access(input) {
      const row = await findVerifiedSubject(input);
      if (!row) return null;
      return {
        requestId: row.request_id,
        state: row.state,
        route: row.route,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        contactEmail: row.contact_email,
        contactPhone: row.contact_phone,
        serviceArea: row.service_area,
        roomType: row.room_type,
        furnitureType: row.furniture_type,
        dimensionsMM: { width: row.width_mm, height: row.height_mm, depth: row.depth_mm },
        obstacles: row.obstacles,
        accessConstraints: row.access_constraints,
        materialPreferences: row.material_preferences,
        finishPreferences: row.finish_preferences,
        missingInformation: row.missing_information,
        riskFlags: row.risk_flags,
        budgetRange: row.budget_range,
        targetDate: row.target_date,
        deliveryRequired: row.delivery_required,
        fittingRequired: row.fitting_required,
        customerNotes: row.customer_notes,
        consentVersion: row.consent_version,
        privacyNoticeVersion: row.privacy_notice_version,
        consentAcceptedAt: row.consent_accepted_at,
        retentionDeleteAfter: row.retention_delete_after
      };
    },

    async erase(input) {
      if (!maintenance) throw new Error('Dedicated intake maintenance database access is required for erasure.');
      const row = await findVerifiedSubject(input);
      if (!row) return { erased: false };
      const deleted = await maintenance`
        DELETE FROM dropi_ops.custom_intake_requests
        WHERE request_id = ${row.request_id}
        RETURNING request_id
      `;
      return { erased: deleted.length === 1, requestId: deleted[0]?.request_id || null };
    },

    async close() {
      await read.end({ timeout: 2 });
      if (maintenance) await maintenance.end({ timeout: 2 });
    }
  };
}
