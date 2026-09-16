import { loadProject } from '../src/project.mjs';
import { validateProject } from '../src/domain.mjs';
import { validateCatalogueMedia } from '../src/catalogue-media.mjs';
import { validateProviderMappings, validateProviderOffers } from '../src/provider-offers.mjs';
import { validateDropshipSuppliers } from '../src/dropship.mjs';
try {
  const p = loadProject();
  const issues = [
    ...validateProject(p),
    ...validateCatalogueMedia(p),
    ...validateProviderMappings(p.providerMappings, p.products.map(x => x.id)),
    ...validateProviderOffers(p.providerOffers),
    ...validateDropshipSuppliers(p.dropshipSuppliers)
  ];
  if (issues.length) throw new Error(issues.join('\n'));
  console.log(`PASS: ${p.guides.length} guides, ${p.products.length} candidates, ${p.providerMappings.length} provider mappings, ${p.providerOffers.length} staged/generated offers, ${p.dropshipSuppliers.length} dropship supplier candidates; source, media, provider, supplier and configuration contracts valid.`);
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
}
