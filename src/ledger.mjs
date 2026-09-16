import { summariseLedger } from '../public/logic.js';
export const emptyLedger = () => ({ schemaVersion: 1, records: [], importedAt: null });
const transitions = { PENDING: ['APPROVED', 'PAID', 'REVERSED'], APPROVED: ['PAID', 'REVERSED'], PAID: ['REVERSED'], REVERSED: [] };
function validEvent(e) {
  if (!e || Object.keys(e).some(k => !['provider', 'transactionId', 'status', 'commissionCents', 'currency', 'updatedAt', 'statementRef'].includes(k))) throw new Error('Unsupported fields. Do not import customer identities or order details.');
  for (const key of ['provider', 'transactionId', 'statementRef']) if (typeof e[key] !== 'string' || !/^[A-Za-z0-9_.-]{1,120}$/.test(e[key])) throw new Error(`Invalid ${key}; use a non-personal report identifier.`);
  if (!Object.hasOwn(transitions, e.status) || e.currency !== 'EUR' || !Number.isSafeInteger(e.commissionCents) || e.commissionCents < 0) throw new Error('Invalid status, currency or commission cents.');
  if (typeof e.updatedAt !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.000Z$/.test(e.updatedAt) || !Number.isFinite(Date.parse(e.updatedAt)) || new Date(e.updatedAt).toISOString() !== e.updatedAt) throw new Error('updatedAt must be a valid canonical UTC timestamp, e.g. 2026-09-15T12:00:00.000Z.');
}
export function importEvents(ledger, events, now = new Date()) {
  summariseLedger(ledger);
  if (!Array.isArray(events) || events.length > 100000) throw new Error('Expected an array of up to 100,000 report events.');
  const next = structuredClone(ledger);
  const map = new Map(next.records.map(r => [`${r.provider}:${r.transactionId}`, r]));
  const ordered = events.map(e => { validEvent(e); return e; }).sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
  let applied = 0, duplicate = 0, stale = 0;
  for (const e of ordered) {
    if (Date.parse(e.updatedAt) > new Date(now).getTime()) throw new Error('Future-dated report event.');
    const key = `${e.provider}:${e.transactionId}`;
    const prev = map.get(key);
    if (prev) {
      if (e.updatedAt < prev.updatedAt) { stale++; continue; }
      if (e.updatedAt === prev.updatedAt) {
        if (['status', 'commissionCents', 'currency', 'statementRef'].some(k => prev[k] !== e[k])) throw new Error('Conflicting event at the same timestamp.');
        duplicate++; continue;
      }
      if (e.currency !== prev.currency || e.commissionCents !== prev.commissionCents) throw new Error('Amount/currency adjustment requires a separate reconciliation; automatic overwrites are blocked.');
      if (e.status !== prev.status && !transitions[prev.status].includes(e.status)) throw new Error(`Invalid transition ${prev.status} → ${e.status}.`);
    }
    // Initial REVERSED has no evidence that money was paid; never invent a clawback.
    map.set(key, { ...e, everPaid: Boolean(prev?.everPaid || e.status === 'PAID') });
    applied++;
  }
  next.records = [...map.values()].sort((a, b) => `${a.provider}:${a.transactionId}`.localeCompare(`${b.provider}:${b.transactionId}`));
  if (applied) next.importedAt = new Date(now).toISOString();
  summariseLedger(next);
  return { ledger: next, applied, duplicate, stale };
}
