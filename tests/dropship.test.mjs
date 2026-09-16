import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDropshipSuppliers, orderTransitionAllowed, applyOrderTransition, contributionModel, pilotEligible } from '../src/dropship.mjs';

const researchSupplier = {
  id: 'example-eu', name: 'Example EU', status: 'RESEARCH_ONLY', website: 'https://example.org/', checkedAt: '2026-09-16',
  irelandDelivery: 'TO_VERIFY', stockSync: 'TO_VERIFY', orderAutomation: 'TO_VERIFY', returnsTerms: 'TO_VERIFY',
  mediaRights: 'TO_VERIFY', tradeAccount: 'APPLICATION_REQUIRED', paidPlanApproved: false
};

test('research-only supplier may stay incomplete without becoming sellable', () => {
  assert.deepEqual(validateDropshipSuppliers([researchSupplier]), []);
});

test('pilot approval fails closed while supplier evidence is still unverified', () => {
  const issues = validateDropshipSuppliers([{ ...researchSupplier, status: 'APPROVED_FOR_PILOT' }]);
  assert.ok(issues.some(x => x.includes('not sufficiently verified')));
});

test('order cannot jump from payment directly to dispatched', () => {
  assert.equal(orderTransitionAllowed('PAYMENT_AUTHORISED', 'DISPATCHED'), false);
  assert.throws(() => applyOrderTransition({ state: 'PAYMENT_AUTHORISED' }, 'DISPATCHED'));
});

test('supplier acceptance is separate from payment', () => {
  let order = { state: 'PAYMENT_AUTHORISED' };
  order = applyOrderTransition(order, 'SUPPLIER_ORDER_PENDING');
  order = applyOrderTransition(order, 'SUPPLIER_ACCEPTED');
  assert.equal(order.state, 'SUPPLIER_ACCEPTED');
});

test('contribution model includes shipping, payment, returns and support reserves', () => {
  const result = contributionModel({ retailPriceEUR: 100, wholesaleCostEUR: 50, shippingCostEUR: 15, paymentFeeEUR: 3, returnDamageReserveEUR: 5, supportReserveEUR: 2, otherVariableCostEUR: 1 });
  assert.equal(result.variableCostEUR, 76);
  assert.equal(result.contributionEUR, 24);
  assert.equal(result.marginRate, 0.24);
});

test('negative or non-numeric unit economics fail rather than create fake margin', () => {
  assert.throws(() => contributionModel({ retailPriceEUR: 100, wholesaleCostEUR: -1, shippingCostEUR: 1, paymentFeeEUR: 1, returnDamageReserveEUR: 1 }));
});

test('pilot eligibility requires approved supplier, passed sample and positive economics', () => {
  assert.equal(pilotEligible({ supplierStatus: 'APPROVED_FOR_PILOT', sampleOrderStatus: 'PASS', contributionEUR: 10, marginRate: 0.1 }), true);
  assert.equal(pilotEligible({ supplierStatus: 'RESEARCH_ONLY', sampleOrderStatus: 'PASS', contributionEUR: 10, marginRate: 0.1 }), false);
  assert.equal(pilotEligible({ supplierStatus: 'APPROVED_FOR_PILOT', sampleOrderStatus: 'NOT_RUN', contributionEUR: 10, marginRate: 0.1 }), false);
});
