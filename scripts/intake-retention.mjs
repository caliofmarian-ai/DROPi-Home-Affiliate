import postgres from 'postgres';

export function retentionExecutionEnabled(env = process.env) {
  return env.INTAKE_RETENTION_EXECUTE === 'true';
}

export async function runRetention({ env = process.env, now = new Date(), log = console.log } = {}) {
  if (!retentionExecutionEnabled(env)) {
    log('Custom intake retention: NO-OP (INTAKE_RETENTION_EXECUTE is not true).');
    return { executed: false, deleted: 0 };
  }
  if (!env.INTAKE_MAINTENANCE_DATABASE_URL) throw new Error('INTAKE_MAINTENANCE_DATABASE_URL is required when retention execution is enabled.');
  const nowDate = new Date(now);
  if (!Number.isFinite(nowDate.getTime())) throw new Error('Retention run requires a valid current timestamp.');

  const sql = postgres(env.INTAKE_MAINTENANCE_DATABASE_URL, { max: 1, idle_timeout: 10, connect_timeout: 8, prepare: true });
  try {
    const rows = await sql`
      DELETE FROM dropi_ops.custom_intake_requests
      WHERE retention_delete_after IS NOT NULL
        AND retention_delete_after <= ${nowDate.toISOString()}
      RETURNING request_id
    `;
    log(`Custom intake retention: deleted ${rows.length} expired request(s).`);
    return { executed: true, deleted: rows.length };
  } finally {
    await sql.end({ timeout: 2 });
  }
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  runRetention().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
