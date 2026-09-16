const SUPPLIER_STATUSES = new Set(['RESEARCH_ONLY','APPLICATION_REQUIRED','TRADE_ACCOUNT_PENDING','TECHNICAL_REVIEW','SAMPLE_TEST_REQUIRED','APPROVED_FOR_PILOT','SUSPENDED','REVOKED']);
const ORDER_STATES = new Set(['CHECKOUT_STARTED','PAYMENT_AUTHORISED','SUPPLIER_ORDER_PENDING','SUPPLIER_ACCEPTED','SUPPLIER_REJECTED','DISPATCHED','DELIVERED','RETURN_REQUESTED','RETURN_IN_TRANSIT','REFUNDED','DEFECT_CLAIM','CLOSED']);
const TRANSITIONS = new Map([
  ['CHECKOUT_STARTED', new Set(['PAYMENT_AUTHORISED','CLOSED'])],
  ['PAYMENT_AUTHORISED', new Set(['SUPPLIER_ORDER_PENDING','REFUNDED','CLOSED'])],
  ['SUPPLIER_ORDER_PENDING', new Set(['SUPPLIER_ACCEPTED','SUPPLIER_REJECTED','REFUNDED'])],
  ['SUPPLIER_ACCEPTED', new Set(['DISPATCHED','REFUNDED','DEFECT_CLAIM'])],
  ['SUPPLIER_REJECTED', new Set(['REFUNDED','CLOSED'])],
  ['DISPATCHED', new Set(['DELIVERED','RETURN_REQUESTED','DEFECT_CLAIM'])],
  ['DELIVERED', new Set(['RETURN_REQUESTED','DEFECT_CLAIM','CLOSED'])],
  ['RETURN_REQUESTED', new Set(['RETURN_IN_TRANSIT','REFUNDED','CLOSED'])],
  ['RETURN_IN_TRANSIT', new Set(['REFUNDED','CLOSED'])],
  ['DEFECT_CLAIM', new Set(['REFUNDED','CLOSED'])],
  ['REFUNDED', new Set(['CLOSED'])],
  ['CLOSED', new Set()]
]);

function safeHttps(raw) {
  try { const u = new URL(raw); return u.protocol === 'https:' && !u.username && !u.password && !u.port && !!u.hostname; } catch { return false; }
}
function dateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const ms = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(ms) && new Date(ms).toISOString().slice(0, 10) === value;
}

const PILOT_EVIDENCE_FIELDS = [
  'irelandDelivery',
  'stockSync',
  'orderAutomation',
  'returnsTerms',
  'mediaRights',
  'tradeAccount',
  'gpsrCompliance',
  'euResponsiblePerson',
  'productTraceability',
  'recallProcess',
  'consumerRemedySupport',
  'customsVatModel'
];
const UNVERIFIED = /^(NOT_VERIFIED|TO_VERIFY|SUPPLIER_DEPENDENT|PUBLICLY_CLAIMED|UNKNOWN|NOT_REVIEWED)$/;

export function validateDropshipSuppliers(suppliers) {
  if (!Array.isArray(suppliers)) return ['Dropship suppliers must be an array.'];
  const issues = []; const seen = new Set();
  for (const supplier of suppliers) {
    const key = supplier?.id || 'unknown';
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key)) issues.push(`${key}: invalid supplier id.`);
    if (seen.has(key)) issues.push(`${key}: duplicate supplier id.`); seen.add(key);
    if (!supplier?.name) issues.push(`${key}: name is required.`);
    if (!SUPPLIER_STATUSES.has(supplier?.status)) issues.push(`${key}: invalid supplier status.`);
    if (!safeHttps(supplier?.website)) issues.push(`${key}: HTTPS website is required.`);
    if (!dateOnly(supplier?.checkedAt)) issues.push(`${key}: checkedAt must be YYYY-MM-DD.`);
    if (typeof supplier?.paidPlanApproved !== 'boolean') issues.push(`${key}: paidPlanApproved must be boolean.`);
    if (supplier?.status === 'APPROVED_FOR_PILOT') {
      for (const field of PILOT_EVIDENCE_FIELDS) {
        if (!supplier[field] || UNVERIFIED.test(supplier[field])) issues.push(`${key}: ${field} is not sufficiently verified for pilot approval.`);
      }
      if (supplier.nonEuFulfilment === true && !['IOSS_VERIFIED','DDP_VERIFIED','IMPORTER_MODEL_VERIFIED'].includes(supplier.customsVatModel)) issues.push(`${key}: non-EU fulfilment requires a verified IOSS/DDP/importer-of-record model.`);
      if (supplier.categoryCompliance === 'NOT_REVIEWED' || !supplier.categoryCompliance) issues.push(`${key}: category-specific product compliance has not been reviewed.`);
    }
  }
  return issues;
}

export function orderTransitionAllowed(from, to) {
  if (!ORDER_STATES.has(from) || !ORDER_STATES.has(to)) return false;
  return TRANSITIONS.get(from).has(to);
}

export function applyOrderTransition(order, to) {
  if (!order || !ORDER_STATES.has(order.state)) throw new Error('Order has invalid current state.');
  if (!orderTransitionAllowed(order.state, to)) throw new Error(`Invalid dropship order transition ${order.state} -> ${to}.`);
  return { ...order, state: to };
}

function money(name, value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) throw new Error(`${name} must be a non-negative number.`);
  return n;
}

export function contributionModel(input) {
  const retail = money('retailPriceEUR', input.retailPriceEUR);
  const wholesale = money('wholesaleCostEUR', input.wholesaleCostEUR);
  const shipping = money('shippingCostEUR', input.shippingCostEUR);
  const payment = money('paymentFeeEUR', input.paymentFeeEUR);
  const returns = money('returnDamageReserveEUR', input.returnDamageReserveEUR);
  const support = money('supportReserveEUR', input.supportReserveEUR || 0);
  const customsDuty = money('customsDutyEUR', input.customsDutyEUR || 0);
  const importVat = money('importVatEUR', input.importVatEUR || 0);
  const customsHandling = money('customsHandlingEUR', input.customsHandlingEUR || 0);
  const other = money('otherVariableCostEUR', input.otherVariableCostEUR || 0);
  const variableCostEUR = wholesale + shipping + payment + returns + support + customsDuty + importVat + customsHandling + other;
  const contributionEUR = retail - variableCostEUR;
  const marginRate = retail === 0 ? 0 : contributionEUR / retail;
  return { retailPriceEUR: retail, variableCostEUR, contributionEUR, marginRate };
}

export function pilotEligible({ supplierStatus, sampleOrderStatus, contributionEUR, marginRate, legalComplianceStatus = 'PASS' }) {
  return supplierStatus === 'APPROVED_FOR_PILOT' && sampleOrderStatus === 'PASS' && legalComplianceStatus === 'PASS' && Number(contributionEUR) > 0 && Number(marginRate) > 0;
}
