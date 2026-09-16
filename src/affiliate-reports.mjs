function cleanId(value, label) {
  const text = String(value ?? '').trim().replace(/[^A-Za-z0-9_.-]/g, '_').slice(0, 120);
  if (!text) throw new Error(`${label} is missing.`);
  return text;
}

function canonicalUtc(value, label) {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) throw new Error(`${label} is not a valid date.`);
  const d = new Date(time);
  d.setUTCMilliseconds(0);
  return d.toISOString();
}

function cents(value, label) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) throw new Error(`${label} must be numeric.`);
  const scaled = Math.round(Math.abs(amount) * 100);
  if (!Number.isSafeInteger(scaled)) throw new Error(`${label} is outside the supported range.`);
  return scaled;
}

export function normaliseAwinTransaction(row, statementRef) {
  if (!row || typeof row !== 'object') throw new Error('Awin transaction must be an object.');
  const rawStatus = String(row.status ?? row.commissionStatus ?? row.commission_status ?? '').toLowerCase();
  const paid = row.paidToPublisher === true || row.paid_to_publisher === true || String(row.paid_to_publisher ?? '').toLowerCase() === 'yes';
  const status = rawStatus === 'pending' ? 'PENDING'
    : rawStatus === 'approved' ? (paid ? 'PAID' : 'APPROVED')
    : ['declined', 'deleted', 'reversed'].includes(rawStatus) ? 'REVERSED'
    : null;
  if (!status) throw new Error(`Unsupported Awin transaction status: ${rawStatus || 'missing'}.`);
  const commission = row.commissionAmount?.amount ?? row.commission?.amount ?? row.commission ?? row.partnerCommission ?? row.partner_commission;
  const currency = row.commissionAmount?.currency ?? row.commission?.currency ?? row.currency ?? row.transactionCurrency ?? row.transaction_currency;
  if (currency !== 'EUR') throw new Error('DROPi Home ledger v1 imports only EUR affiliate commission.');
  const updated = row.amendmentDate ?? row.amendment_date ?? row.validationDate ?? row.validation_date ?? row.transactionDate ?? row.date;
  return {
    provider: 'awin',
    transactionId: cleanId(row.id ?? row.transactionId ?? row.transaction_id, 'Awin transaction id'),
    status,
    commissionCents: cents(commission, 'Awin commission'),
    currency: 'EUR',
    updatedAt: canonicalUtc(updated, 'Awin transaction timestamp'),
    statementRef: cleanId(statementRef, 'statementRef')
  };
}

export function normaliseAwinTransactions(rows, statementRef) {
  if (!Array.isArray(rows)) throw new Error('Awin API response must be an array.');
  const byId = new Map();
  for (const row of rows) {
    const event = normaliseAwinTransaction(row, statementRef);
    const previous = byId.get(event.transactionId);
    if (!previous || event.updatedAt > previous.updatedAt) byId.set(event.transactionId, event);
    else if (event.updatedAt === previous.updatedAt && JSON.stringify(event) !== JSON.stringify(previous)) throw new Error(`Conflicting Awin snapshot for ${event.transactionId}.`);
  }
  return [...byId.values()].sort((a, b) => a.updatedAt.localeCompare(b.updatedAt) || a.transactionId.localeCompare(b.transactionId));
}

export function parseCsv(text) {
  if (typeof text !== 'string') throw new Error('CSV input must be text.');
  const rows = []; let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
    else field += ch;
  }
  if (quoted) throw new Error('CSV has an unterminated quoted field.');
  if (field.length || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row); }
  return rows.filter(r => r.some(x => x !== ''));
}

function keyName(value) { return String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''); }

export function normaliseEbayTdrCsv(text, { statementRef, currency = 'EUR' } = {}) {
  if (currency !== 'EUR') throw new Error('DROPi Home ledger v1 imports only EUR EPN earnings.');
  const table = parseCsv(text);
  if (table.length < 2) return [];
  const headers = table[0].map(keyName);
  const pick = (record, names) => { for (const name of names) { const index = headers.indexOf(name); if (index >= 0 && record[index] != null && record[index] !== '') return record[index]; } return null; };
  const events = [];
  for (const record of table.slice(1)) {
    const rawStatus = String(pick(record, ['status', 'transaction_status']) || '').trim().toLowerCase();
    const status = rawStatus === 'pending' ? 'PENDING' : rawStatus === 'approved' ? 'APPROVED' : ['reversed', 'declined'].includes(rawStatus) ? 'REVERSED' : null;
    if (!status) throw new Error(`Unsupported eBay TDR status: ${rawStatus || 'missing'}.`);
    const earnings = pick(record, ['earnings', 'earnings_amount']);
    const updated = pick(record, ['update_date', 'updated_date', 'event_date']);
    const transactionId = pick(record, ['partner_network_transaction_id', 'ebay_transaction_id', 'transaction_id', 'ebay_checkout_transaction_id']);
    events.push({
      provider: 'ebay', transactionId: cleanId(transactionId, 'eBay transaction id'), status,
      commissionCents: cents(earnings, 'eBay earnings'), currency: 'EUR', updatedAt: canonicalUtc(updated, 'eBay update date'),
      statementRef: cleanId(statementRef, 'statementRef')
    });
  }
  return events.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt) || a.transactionId.localeCompare(b.transactionId));
}
