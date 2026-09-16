/** Pure browser/server logic. No network access, cookies or persistent storage. */
export function finiteNumber(value, label, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  if (!['number', 'string'].includes(typeof value) || (typeof value === 'string' && value.trim() === '')) throw new Error(`${label} is required.`);
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max) throw new Error(`${label} must be a number from ${min} to ${max}.`);
  return n;
}

/** Dimensions are in mm. Clearance is TOTAL per axis, not clearance on each side. */
export function checkFit(product, space, { clearanceMM = 5, allowRotation = false } = {}) {
  const c = finiteNumber(clearanceMM, 'Total clearance', { max: 1000 });
  const s = Object.fromEntries(['width', 'depth', 'height'].map(k => [k, finiteNumber(space[k], `Space ${k}`, { min: 1, max: 100000 })]));
  const p = Object.fromEntries(['width', 'depth', 'height'].map(k => [k, finiteNumber(product.dimensionsMM?.[k], `Product ${k}`, { min: 1, max: 100000 })]));
  const minimum = product.minSpaceHeightMM == null ? p.height : finiteNumber(product.minSpaceHeightMM, 'Manufacturer minimum height', { min: 1, max: 100000 });
  const requiredHeight = Math.max(p.height + c, minimum);
  const fits = (w, d) => w + c <= s.width && d + c <= s.depth && requiredHeight <= s.height;
  const original = fits(p.width, p.depth);
  const rotated = !original && allowRotation && fits(p.depth, p.width);
  const margin = { width: s.width - (rotated ? p.depth : p.width), depth: s.depth - (rotated ? p.width : p.depth), height: s.height - p.height };
  return { fits: original || rotated, rotated, margin, requiredHeight, status: original || rotated ? 'DIMENSIONAL_MATCH' : 'DOES_NOT_FIT', caveat: 'Geometric screening only; check loaded contents, handles, opening route, tolerances and current manufacturer instructions.' };
}

export function estimateScenario(input) {
  const visits = finiteNumber(input.visits, 'Visits', { max: 1e9 });
  const outboundRate = finiteNumber(input.outboundRate, 'Outbound rate', { max: 1 });
  const conversionRate = finiteNumber(input.conversionRate, 'Conversion rate', { max: 1 });
  const basketEUR = finiteNumber(input.basketEUR, 'Eligible basket', { max: 1e6 });
  const commissionRate = finiteNumber(input.commissionRate, 'Commission rate', { max: 1 });
  const reversalRate = finiteNumber(input.reversalRate, 'Reversal rate', { max: 1 });
  const costsEUR = finiteNumber(input.costsEUR, 'Costs', { max: 1e9 });
  const clicks = visits * outboundRate;
  const purchases = clicks * conversionRate;
  const grossEUR = purchases * basketEUR * commissionRate;
  const netCommissionEUR = grossEUR * (1 - reversalRate);
  return { clicks, purchases, grossEUR, netCommissionEUR, beforeTaxEUR: netCommissionEUR - costsEUR, expectedCommissionPerClickEUR: clicks ? netCommissionEUR / clicks : 0, hypothetical: true };
}

export function normaliseSearch(value) { return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); }
export function filterProducts(products, { query = '', category = 'all' } = {}) {
  const q = normaliseSearch(query);
  return products.filter(p => (category === 'all' || p.category === category) && normaliseSearch(`${p.name} ${p.note} ${p.merchantId}`).includes(q));
}

export function summariseLedger(ledger) {
  if (!ledger || ledger.schemaVersion !== 1 || !Array.isArray(ledger.records)) throw new Error('Expected a schemaVersion 1 ledger.');
  const totals = { pendingCents: 0, approvedUnpaidCents: 0, paidGrossCents: 0, reversedCents: 0, clawbackCents: 0, cashNetCents: 0, transactions: ledger.records.length, verifiedIncome: false };
  const seen = new Set();
  for (const r of ledger.records) {
    if (!r || typeof r.provider !== 'string' || !r.provider.trim() || typeof r.transactionId !== 'string' || !r.transactionId.trim()) throw new Error('Missing provider or transaction identifier.');
    const key = `${r.provider}:${r.transactionId}`;
    if (seen.has(key)) throw new Error('Duplicate transaction in ledger.');
    seen.add(key);
    if (r.currency !== 'EUR' || !Number.isSafeInteger(r.commissionCents) || r.commissionCents < 0 || typeof r.everPaid !== 'boolean') throw new Error('Ledger amounts must be non-negative integer EUR cents with explicit payment state.');
    if (!['PENDING', 'APPROVED', 'PAID', 'REVERSED'].includes(r.status)) throw new Error('Unknown transaction state.');
    if (r.status === 'PAID' && !r.everPaid) throw new Error('Paid transaction lacks payment evidence flag.');
    if (['PENDING', 'APPROVED'].includes(r.status) && r.everPaid) throw new Error('Paid transaction cannot be pending or approved.');
    if (r.status === 'PENDING') totals.pendingCents += r.commissionCents;
    if (r.status === 'APPROVED') totals.approvedUnpaidCents += r.commissionCents;
    if (r.everPaid) totals.paidGrossCents += r.commissionCents;
    if (r.status === 'REVERSED') {
      totals.reversedCents += r.commissionCents;
      if (r.everPaid) totals.clawbackCents += r.commissionCents;
    }
  }
  if (Object.values(totals).some(x => typeof x === 'number' && !Number.isSafeInteger(x))) throw new Error('Ledger total exceeds safe integer range.');
  totals.cashNetCents = totals.paidGrossCents - totals.clawbackCents;
  // A parsed report is not independent bank reconciliation or tax certification.
  return totals;
}
