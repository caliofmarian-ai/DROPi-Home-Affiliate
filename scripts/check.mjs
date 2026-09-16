import { loadProject } from '../src/project.mjs';
import { validateProject } from '../src/domain.mjs';
try { const p = loadProject(); const issues = validateProject(p); if (issues.length) throw new Error(issues.join('\n')); console.log(`PASS: ${p.guides.length} guides, ${p.products.length} candidates; source and configuration contracts valid.`); } catch (err) { console.error(err.message); process.exitCode = 1; }
