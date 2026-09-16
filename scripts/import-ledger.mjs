import { readFileSync, writeFileSync, existsSync, openSync, closeSync, unlinkSync, renameSync, mkdirSync } from 'node:fs';
import { resolve, dirname, sep } from 'node:path';
import { emptyLedger, importEvents } from '../src/ledger.mjs';
const args = process.argv.slice(2); let lock, lockPath, tmp;
try {
  if (args.length !== 3 || args[1] !== '--out') throw new Error('Usage: npm run ledger:import -- input-events.json --out private/ledger.json');
  const input = resolve(args[0]), output = resolve(args[2]);
  const privateRoot = resolve('private');
  if (!output.startsWith(privateRoot + sep) || output === input) throw new Error('Output must be inside private/ and distinct from input. Never commit real statements.');
  mkdirSync(dirname(output), { recursive: true, mode: 0o700 }); lockPath = output + '.lock'; lock = openSync(lockPath, 'wx', 0o600);
  const old = existsSync(output) ? JSON.parse(readFileSync(output, 'utf8')) : emptyLedger();
  const result = importEvents(old, JSON.parse(readFileSync(input, 'utf8')));
  tmp = `${output}.${process.pid}.tmp`; writeFileSync(tmp, JSON.stringify(result.ledger, null, 2) + '\n', { flag: 'wx', mode: 0o600 }); renameSync(tmp, output); tmp = null;
  console.log(JSON.stringify({ applied: result.applied, duplicate: result.duplicate, stale: result.stale, path: output, bankReconciled: false }));
} catch (err) { console.error(err.code === 'EEXIST' ? 'Import locked by another process; no file changed.' : err.message); process.exitCode = 1; }
finally { if (tmp && existsSync(tmp)) unlinkSync(tmp); if (lock !== undefined) { closeSync(lock); unlinkSync(lockPath); } }
