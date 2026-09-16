const VERIFIED_OR_NA = new Set(['VERIFIED', 'NOT_APPLICABLE_VERIFIED']);
const EPR_STATUSES = new Set(['VERIFIED', 'NOT_APPLICABLE_VERIFIED']);
const PROMOTION_STATUSES = new Set(['NO_PRICE_REDUCTION_CLAIM', 'PRIOR_PRICE_30_DAY_VERIFIED']);
const GREEN_STATUSES = new Set(['NO_ENVIRONMENTAL_CLAIMS', 'CLAIMS_EVIDENCED_AND_REVIEWED']);
const IMPORT_MODELS = new Set(['EU_STOCK_VERIFIED', 'IOSS_VERIFIED', 'DDP_VERIFIED', 'IMPORTER_MODEL_VERIFIED']);

function nonBlank(value) { return typeof value === 'string' && value.trim().length > 0; }
function safeHttps(value) { try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password && !u.port; } catch { return false; } }

export function validateDropshipSkus(skus, suppliers = []) {
  if (!Array.isArray(skus)) return ['Dropship SKUs must be an array.'];
  const issues = [];
  const seen = new Set();
  const supplierIds = new Set((suppliers || []).map(x => x.id));
  for (const sku of skus) {
    const id = sku?.id || 'unknown';
    const label = `Dropship SKU ${id}`;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) issues.push(`${label}: invalid id.`);
    if (seen.has(id)) issues.push(`${label}: duplicate id.`); seen.add(id);
    if (!nonBlank(sku?.supplierId) || (supplierIds.size && !supplierIds.has(sku.supplierId))) issues.push(`${label}: unknown supplierId.`);
    if (!nonBlank(sku?.supplierSku)) issues.push(`${label}: supplierSku is required.`);
    if (!['RESEARCH_ONLY', 'SAMPLE_TEST_REQUIRED', 'APPROVED_FOR_PILOT', 'SUSPENDED', 'REVOKED'].includes(sku?.status)) issues.push(`${label}: invalid status.`);
    if (sku?.sourceUrl != null && !safeHttps(sku.sourceUrl)) issues.push(`${label}: sourceUrl must be HTTPS.`);

    if (sku?.status !== 'APPROVED_FOR_PILOT') continue;

    if (!nonBlank(sku?.manufacturer?.name) || !nonBlank(sku?.manufacturer?.contact)) issues.push(`${label}: manufacturer identity/contact is required for pilot approval.`);
    if (!VERIFIED_OR_NA.has(sku?.gpsrStatus)) issues.push(`${label}: GPSR status must be VERIFIED or NOT_APPLICABLE_VERIFIED.`);
    if (!VERIFIED_OR_NA.has(sku?.euResponsiblePersonStatus)) issues.push(`${label}: EU responsible-person status is not verified.`);
    if (sku.euResponsiblePersonStatus === 'VERIFIED' && !nonBlank(sku?.euResponsiblePerson?.name)) issues.push(`${label}: verified EU responsible person requires identity.`);
    if (sku?.traceabilityStatus !== 'VERIFIED') issues.push(`${label}: product traceability is not verified.`);
    if (!VERIFIED_OR_NA.has(sku?.warningsSafetyStatus)) issues.push(`${label}: warnings/safety information is not verified.`);
    if (sku?.categoryComplianceStatus !== 'VERIFIED') issues.push(`${label}: category-specific compliance is not verified.`);
    if (!EPR_STATUSES.has(sku?.producerResponsibilityStatus)) issues.push(`${label}: packaging/EPR producer-responsibility status is not verified.`);
    if (!GREEN_STATUSES.has(sku?.environmentalClaimsStatus)) issues.push(`${label}: environmental-claims review is missing.`);
    if (!PROMOTION_STATUSES.has(sku?.pricePromotionStatus)) issues.push(`${label}: price-promotion/prior-price review is missing.`);

    const flags = sku?.regulatedCategoryFlags || {};
    if (flags.electricalElectronic === true && sku.weeeComplianceStatus !== 'VERIFIED') issues.push(`${label}: EEE requires verified WEEE/distance-seller compliance before pilot.`);
    if (flags.containsBattery === true && sku.batteryComplianceStatus !== 'VERIFIED') issues.push(`${label}: battery product requires verified battery-producer/distributor compliance before pilot.`);
    if (flags.upholsteredFurniture === true && sku.upholsteredFireSafetyStatus !== 'VERIFIED') issues.push(`${label}: upholstered furniture requires verified Irish fire-safety/labelling compliance before pilot.`);
    if (flags.rightToRepairRegulated === true && sku.rightToRepairStatus !== 'VERIFIED') issues.push(`${label}: in-scope repairability/right-to-repair obligations are not verified.`);

    if (!nonBlank(sku?.shippingOriginCountryCode) || !/^[A-Z]{2}$/.test(sku.shippingOriginCountryCode)) issues.push(`${label}: shipping origin country code is required.`);
    if (!IMPORT_MODELS.has(sku?.customsVatModel)) issues.push(`${label}: customs/VAT model is not verified.`);
    if (sku.shippingOriginCountryCode !== 'IE' && sku.customsVatModel === 'EU_STOCK_VERIFIED' && sku.euStockVerified !== true) issues.push(`${label}: EU_STOCK_VERIFIED requires explicit euStockVerified=true.`);
    if (sku.nonEuFulfilment === true && !['IOSS_VERIFIED', 'DDP_VERIFIED', 'IMPORTER_MODEL_VERIFIED'].includes(sku.customsVatModel)) issues.push(`${label}: non-EU fulfilment requires IOSS/DDP/importer model verification.`);

    if (sku?.sampleOrderStatus !== 'PASS') issues.push(`${label}: real sample order has not passed.`);
    if (sku?.legalComplianceStatus !== 'PASS') issues.push(`${label}: legalComplianceStatus must be PASS.`);
    if (!Number.isFinite(Number(sku?.landedContributionEUR)) || Number(sku.landedContributionEUR) <= 0) issues.push(`${label}: positive landed contribution is required.`);
  }
  return issues;
}
