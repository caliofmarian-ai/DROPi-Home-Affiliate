import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDropshipSkus } from '../src/dropship-sku.mjs';

const suppliers = [{ id: 'supplier-one' }];
const research = {
  id: 'sample-sku',
  supplierId: 'supplier-one',
  supplierSku: 'ABC-123',
  status: 'RESEARCH_ONLY',
  sourceUrl: 'https://supplier.example/product/abc-123'
};

const approved = {
  ...research,
  status: 'APPROVED_FOR_PILOT',
  manufacturer: { name: 'Example Manufacturer', contact: 'manufacturer@example.com' },
  gpsrStatus: 'VERIFIED',
  euResponsiblePersonStatus: 'VERIFIED',
  euResponsiblePerson: { name: 'Example EU Responsible Person' },
  traceabilityStatus: 'VERIFIED',
  warningsSafetyStatus: 'VERIFIED',
  categoryComplianceStatus: 'VERIFIED',
  producerResponsibilityStatus: 'VERIFIED',
  environmentalClaimsStatus: 'NO_ENVIRONMENTAL_CLAIMS',
  pricePromotionStatus: 'NO_PRICE_REDUCTION_CLAIM',
  regulatedCategoryFlags: {
    electricalElectronic: false,
    containsBattery: false,
    upholsteredFurniture: false,
    rightToRepairRegulated: false
  },
  shippingOriginCountryCode: 'DE',
  customsVatModel: 'EU_STOCK_VERIFIED',
  euStockVerified: true,
  nonEuFulfilment: false,
  sampleOrderStatus: 'PASS',
  legalComplianceStatus: 'PASS',
  landedContributionEUR: 25
};

test('empty and research-only dropship SKU registries are safe', () => {
  assert.deepEqual(validateDropshipSkus([], suppliers), []);
  assert.deepEqual(validateDropshipSkus([research], suppliers), []);
});

test('unknown dropship supplier id is rejected', () => {
  const issues = validateDropshipSkus([{ ...research, supplierId: 'missing-supplier' }], suppliers);
  assert.ok(issues.some(x => x.includes('unknown supplierId')));
});

test('pilot approval fails closed without SKU-level legal evidence', () => {
  const issues = validateDropshipSkus([{ ...research, status: 'APPROVED_FOR_PILOT' }], suppliers);
  assert.ok(issues.some(x => x.includes('manufacturer identity')));
  assert.ok(issues.some(x => x.includes('GPSR')));
  assert.ok(issues.some(x => x.includes('sample order')));
  assert.ok(issues.some(x => x.includes('positive landed contribution')));
});

test('fully verified EU-stock SKU can pass pilot validation', () => {
  assert.deepEqual(validateDropshipSkus([approved], suppliers), []);
});

test('regulated product flags require their category-specific evidence', () => {
  const risky = {
    ...approved,
    regulatedCategoryFlags: {
      electricalElectronic: true,
      containsBattery: true,
      upholsteredFurniture: true,
      rightToRepairRegulated: true
    }
  };
  const issues = validateDropshipSkus([risky], suppliers);
  assert.ok(issues.some(x => x.includes('WEEE')));
  assert.ok(issues.some(x => x.includes('battery')));
  assert.ok(issues.some(x => x.includes('fire-safety')));
  assert.ok(issues.some(x => x.includes('right-to-repair')));
});

test('regulated product can pass only after all category-specific evidence is verified', () => {
  const verified = {
    ...approved,
    regulatedCategoryFlags: {
      electricalElectronic: true,
      containsBattery: true,
      upholsteredFurniture: true,
      rightToRepairRegulated: true
    },
    weeeComplianceStatus: 'VERIFIED',
    batteryComplianceStatus: 'VERIFIED',
    upholsteredFireSafetyStatus: 'VERIFIED',
    rightToRepairStatus: 'VERIFIED'
  };
  assert.deepEqual(validateDropshipSkus([verified], suppliers), []);
});

test('non-EU fulfilment cannot use an EU-stock placeholder model', () => {
  const nonEu = {
    ...approved,
    shippingOriginCountryCode: 'CN',
    nonEuFulfilment: true,
    customsVatModel: 'EU_STOCK_VERIFIED',
    euStockVerified: true
  };
  const issues = validateDropshipSkus([nonEu], suppliers);
  assert.ok(issues.some(x => x.includes('non-EU fulfilment')));
});
