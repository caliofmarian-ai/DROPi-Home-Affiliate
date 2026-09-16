import { loadProject } from '../src/project.mjs';
import { validateProject } from '../src/domain.mjs';
import { validateCatalogueMedia } from '../src/catalogue-media.mjs';
try { const p = loadProject(); const issues = [...validateProject(p), ...validateCatalogueMedia(p)]; if (issues.length) throw new Error(issues.join('\n')); console.log(`PASS: ${p.guides.length} guides, ${p.products.length} candidates; source, media and configuration contracts valid.`); } catch (err) { console.error(err.message); process.exitCode = 1; }
