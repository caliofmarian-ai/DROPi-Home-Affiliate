import { loadProject } from '../src/project.mjs';
import { validateProject } from '../src/domain.mjs';
import { validateCatalogueMedia } from '../src/catalogue-media.mjs';
import { validateProviderMappings, validateProviderOffers } from '../src/provider-offers.mjs';
import { validateCommercialApprovals } from '../src/commercial-offers.mjs';
import { validateDropshipSuppliers } from '../src/dropship.mjs';
import { validateDropshipSkus } from '../src/dropship-sku.mjs';
import { validateCustomIntakePolicy } from '../src/custom-intake.mjs';
try {
  const p = loadProject();
  const issues = [
    ...validateProject(p),
    ...validateCatalogueMedia(p),
    ...validateProviderMappings(p.providerMappings, p.products.map(x => x.id)),
    ...validateProviderOffers(p.providerOffers),
    ...validateCommercialApprovals(p),
    ...validateDropshipSuppliers(p.dropshipSuppliers),
    ...validateDropshipSkus(p.dropshipSkus, p.dropshipSuppliers),
    ...validateCustomIntakePolicy(p.customIntakePolicy, p.evidenceExists)
  ];
  if (issues.length) throw new Error(issues.join('\n'));
  console.log(`PASS: ${p.guides.length} guides, ${p.products.length} candidates, ${p.providerMappings.length} provider mappings, ${p.providerOffers.length} staged/generated offers, ${p.dropshipSuppliers.length} dropship supplier candidates, ${p.dropshipSkus.length} dropship SKUs; custom intake ${p.customIntakePolicy.status}; source, media, provider, commercial-approval, supplier, SKU-compliance, intake-policy and configuration contracts valid.`);
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
}
