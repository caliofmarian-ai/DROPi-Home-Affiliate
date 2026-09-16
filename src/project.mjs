import { readFileSync, readdirSync, realpathSync, lstatSync } from 'node:fs';
import { resolve, sep } from 'node:path';
export function loadProject(root = process.cwd()) {
  const json = name => JSON.parse(readFileSync(resolve(root, 'data', `${name}.json`), 'utf8'));
  const evidenceRoot = realpathSync(resolve(root, 'docs/evidence'));
  const evidenceExists = path => {
    if (typeof path !== 'string' || !/^docs\/evidence\/[A-Za-z0-9/_-]+\.md$/.test(path)) return false;
    try { const f = resolve(root, path); return !lstatSync(f).isSymbolicLink() && realpathSync(f).startsWith(evidenceRoot + sep) && readFileSync(f, 'utf8').trim().length >= 40; } catch { return false; }
  };
  const guides = readdirSync(resolve(root, 'content/guides')).filter(f => f.endsWith('.json')).sort().map(f => JSON.parse(readFileSync(resolve(root, 'content/guides', f), 'utf8')));
  return {
    site: json('site'),
    products: json('products'),
    merchants: json('merchants'),
    programs: json('programs'),
    links: json('affiliate-links'),
    reviews: json('reviews'),
    providerMappings: json('provider-mappings'),
    providerOffers: json('affiliate-offers.generated'),
    dropshipSuppliers: json('dropship-suppliers'),
    dropshipSkus: json('dropship-skus'),
    guides,
    evidenceExists
  };
}
