import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { normaliseAwinTransactions } from '../src/affiliate-reports.mjs';

function isoNoMillis(date) { return new Date(date).toISOString().replace('.000Z', 'Z'); }
function dayRef(value) { return new Date(value).toISOString().slice(0, 10).replace(/-/g, ''); }

export async function fetchAwinTransactions({
  publisherId = process.env.AWIN_PUBLISHER_ID,
  accessToken = process.env.AWIN_ACCESS_TOKEN,
  start = process.env.AWIN_REPORT_START,
  end = process.env.AWIN_REPORT_END,
  now = new Date(),
  fetchImpl = fetch
} = {}) {
  if (!publisherId || !accessToken) return { skipped: true, reason: 'AWIN_NOT_CONFIGURED', events: [] };
  if (!/^\d+$/.test(String(publisherId))) throw new Error('AWIN_PUBLISHER_ID must be numeric.');
  const endDate = end ? new Date(end) : new Date(now);
  const startDate = start ? new Date(start) : new Date(endDate.getTime() - 30 * 86400000);
  if (![startDate.getTime(), endDate.getTime()].every(Number.isFinite) || startDate > endDate) throw new Error('Invalid Awin report date range.');
  if (endDate - startDate > 31 * 86400000) throw new Error('Awin transaction API supports at most a 31-day date range.');
  const statementRef = `awin_${dayRef(startDate)}_${dayRef(endDate)}`;
  const headers = { Authorization: `Bearer ${accessToken}` };
  const merged = [];
  for (const dateType of ['transaction', 'amendment']) {
    const url = new URL(`https://api.awin.com/publishers/${publisherId}/transactions/`);
    url.searchParams.set('startDate', isoNoMillis(startDate));
    url.searchParams.set('endDate', isoNoMillis(endDate));
    url.searchParams.set('dateType', dateType);
    url.searchParams.set('timezone', 'UTC');
    url.searchParams.set('showBasketProducts', 'false');
    const response = await fetchImpl(url, { headers });
    const text = await response.text();
    if (!response.ok) throw new Error(`Awin transaction ${dateType} fetch failed with ${response.status}: ${text.slice(0, 250)}`);
    let rows; try { rows = JSON.parse(text); } catch { throw new Error(`Awin transaction ${dateType} response was invalid JSON.`); }
    if (!Array.isArray(rows)) throw new Error(`Awin transaction ${dateType} response must be an array.`);
    merged.push(...rows);
  }
  return { skipped: false, statementRef, events: normaliseAwinTransactions(merged, statementRef) };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  fetchAwinTransactions().then(result => {
    if (result.skipped) { console.log('SKIP: Awin reporting is not configured.'); return; }
    const output = resolve(process.env.AWIN_REPORT_OUTPUT || `private/${result.statementRef}.json`);
    const privateRoot = resolve('private');
    if (!output.startsWith(privateRoot + sep)) throw new Error('AWIN_REPORT_OUTPUT must remain under private/.');
    mkdirSync(privateRoot, { recursive: true, mode: 0o700 });
    writeFileSync(output, `${JSON.stringify(result.events, null, 2)}\n`, { mode: 0o600 });
    console.log(JSON.stringify({ events: result.events.length, statementRef: result.statementRef, output, containsCustomerIdentity: false }));
  }).catch(error => { console.error(error.message); process.exitCode = 1; });
}
