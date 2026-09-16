import { loadProject } from '../src/project.mjs';
import { releaseIssues } from '../src/domain.mjs';
try { const blockers = releaseIssues(loadProject(), process.env); console.log(JSON.stringify({ state: blockers.length ? 'HOLD' : 'READY_FOR_OWNER_RELEASE', blockers }, null, 2)); process.exitCode = blockers.length ? 2 : 0; } catch (err) { console.error(err.message); process.exitCode = 1; }
