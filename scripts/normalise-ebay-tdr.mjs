import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { normaliseEbayTdrCsv } from '../src/affiliate-reports.mjs';

const args = process.argv.slice(2);
try {
  if (args.length !== 3 || args[1] !== '--out') throw new Error('Usage: npm run report:ebay -- private/tdr.csv --out private/epn-events.json');
  const input = resolve(args[0]); const output = resolve(args[2]); const privateRoot = resolve('private');
  if (!input.startsWith(privateRoot + sep) || !output.startsWith(privateRoot + sep) || input === output) throw new Error('Input/output must be distinct files under private/.');
  const statementRef = process.env.EPN_STATEMENT_REF || `epn_${new Date().toISOString().slice(0,10).replace(/-/g,'')}`;
  const events = normaliseEbayTdrCsv(readFileSync(input, 'utf8'), { statementRef, currency: process.env.EPN_REPORT_CURRENCY || 'EUR' });
  mkdirSync(privateRoot, { recursive: true, mode: 0o700 }); writeFileSync(output, `${JSON.stringify(events, null, 2)}\n`, { mode: 0o600 });
  console.log(JSON.stringify({ events: events.length, statementRef, output, containsCustomerIdentity: false }));
} catch (error) { console.error(error.message); process.exitCode = 1; }
