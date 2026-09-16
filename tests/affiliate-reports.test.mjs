import test from 'node:test';
import assert from 'node:assert/strict';
import { normaliseAwinTransaction, normaliseAwinTransactions, parseCsv, normaliseEbayTdrCsv } from '../src/affiliate-reports.mjs';

test('Awin pending API record becomes privacy-minimised ledger event', () => {
  const event = normaliseAwinTransaction({ id: 12345, status: 'pending', commissionAmount: { amount: 4.25, currency: 'EUR' }, transactionDate: '2026-09-16T10:11:12Z', orderRef: 'customer-order-should-not-leak', clickRef: 'dropi-home-product' }, 'awin-2026-09-16');
  assert.deepEqual(Object.keys(event).sort(), ['commissionCents','currency','provider','statementRef','status','transactionId','updatedAt'].sort());
  assert.equal(event.status, 'PENDING'); assert.equal(event.commissionCents, 425); assert.equal(JSON.stringify(event).includes('customer-order'), false);
});

test('Awin approved paid flag can become PAID without importing customer fields', () => {
  const event = normaliseAwinTransaction({ id: 'tx.1', status: 'approved', paidToPublisher: true, commission: { amount: 8.5, currency: 'EUR' }, validationDate: '2026-09-16T12:00:00Z' }, 'awin-report');
  assert.equal(event.status, 'PAID'); assert.equal(event.commissionCents, 850);
});

test('Awin declined/deleted are reversal states and negative values are stored as absolute commission', () => {
  const event = normaliseAwinTransaction({ id: 9, status: 'declined', commissionAmount: { amount: -2, currency: 'EUR' }, amendmentDate: '2026-09-16T12:00:00Z' }, 'awin-report');
  assert.equal(event.status, 'REVERSED'); assert.equal(event.commissionCents, 200);
});

test('Awin report deduplicates current snapshots by latest update timestamp', () => {
  const events = normaliseAwinTransactions([
    { id: 1, status: 'pending', commissionAmount: { amount: 1, currency: 'EUR' }, transactionDate: '2026-09-15T12:00:00Z' },
    { id: 1, status: 'approved', commissionAmount: { amount: 1, currency: 'EUR' }, validationDate: '2026-09-16T12:00:00Z' }
  ], 'awin-window');
  assert.equal(events.length, 1); assert.equal(events[0].status, 'APPROVED');
});

test('Awin adapter rejects foreign currencies rather than silently converting', () => {
  assert.throws(() => normaliseAwinTransaction({ id: 1, status: 'approved', commissionAmount: { amount: 1, currency: 'GBP' }, transactionDate: '2026-09-16T12:00:00Z' }, 'awin'), /EUR/);
});

test('CSV parser handles quoted commas and escaped quotes', () => {
  const rows = parseCsv('A,B\n"x,y","say ""hi"""\n');
  assert.deepEqual(rows[1], ['x,y', 'say "hi"']);
});

test('eBay TDR keeps only transaction status earnings and update timestamp', () => {
  const csv = 'Event Date,Update Date,Status,Partner Network Transaction ID,Earnings,Campaign Name,Landing Page URL\n"2026-09-15 10:00:00","2026-09-16 11:30:00",Approved,"123-456",6.40,"DROPi, Home",https://example.org/private-path\n';
  const [event] = normaliseEbayTdrCsv(csv, { statementRef: 'epn-2026-09-16', currency: 'EUR' });
  assert.equal(event.provider, 'ebay'); assert.equal(event.transactionId, '123-456'); assert.equal(event.commissionCents, 640); assert.equal(event.status, 'APPROVED');
  assert.equal(JSON.stringify(event).includes('Landing'), false); assert.equal(JSON.stringify(event).includes('private-path'), false);
});

test('eBay TDR reversal maps to REVERSED and accepts negative earnings', () => {
  const csv = 'Update Date,Status,Partner Network Transaction ID,Earnings\n2026-09-16T12:00:00Z,Reversed,ABC123,-5.00\n';
  const [event] = normaliseEbayTdrCsv(csv, { statementRef: 'epn-report', currency: 'EUR' });
  assert.equal(event.status, 'REVERSED'); assert.equal(event.commissionCents, 500);
});

test('eBay TDR rejects a non-EUR account report in ledger v1', () => {
  assert.throws(() => normaliseEbayTdrCsv('Status,Partner Network Transaction ID,Earnings,Update Date\nApproved,1,2,2026-09-16T12:00:00Z\n', { statementRef: 'x', currency: 'GBP' }), /EUR/);
});
