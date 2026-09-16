import { estimateScenario } from '../public/logic.js';
console.log(JSON.stringify(estimateScenario({ visits: 10000, outboundRate: .25, conversionRate: .04, basketEUR: 80, commissionRate: .05, reversalRate: 0, costsEUR: 40 }), null, 2));
