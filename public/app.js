import { checkFit, estimateScenario, filterProducts, summariseLedger } from './logic.js';
const $ = id => document.getElementById(id);
const euro = n => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(n);
function el(tag, text, className) { const node = document.createElement(tag); if (text != null) node.textContent = text; if (className) node.className = className; return node; }
function showError(target, error) { target.replaceChildren(el('p', error.message || 'The operation could not be completed.', 'result-fail')); }
let cataloguePromise;
async function catalogue() { if (!cataloguePromise) cataloguePromise = fetch('/catalogue.json', { credentials: 'same-origin', cache: 'no-store' }).then(async res => { if (!res.ok) throw new Error('Candidate data is unavailable. Please reload.'); const data = await res.json(); if (!Array.isArray(data)) throw new Error('Invalid candidate data.'); return data; }); return cataloguePromise; }
function productMedia(product) {
  const media = el('div', null, 'product-media');
  if (product?.media?.status === 'APPROVED' && typeof product.media.url === 'string') {
    const img = document.createElement('img');
    img.src = product.media.url; img.alt = product.media.alt || product.name || 'Product image'; img.loading = 'lazy'; img.decoding = 'async';
    media.append(img);
    const label = el('span', product.media.source === 'AWIN_FEED' ? 'Partner feed image' : 'Authorised product image', 'media-source'); media.append(label);
  } else {
    const mark = el('span', '▧', 'media-placeholder-mark');
    const copy = el('span', 'Image pending approved partner feed', 'media-placeholder-copy');
    media.classList.add('product-media-placeholder'); media.append(mark, copy);
  }
  return media;
}
async function initProductMedia() {
  const cards = [...document.querySelectorAll('[data-product-id]')]; if (!cards.length) return;
  const products = await catalogue(); const byId = new Map(products.map(p => [p.id, p]));
  for (const card of cards) { if (card.querySelector('.product-media')) continue; const product = byId.get(card.dataset.productId); if (product) card.prepend(productMedia(product)); }
}
async function initCatalogue() {
  const products = await catalogue(); const chosen = new Set();
  const updateFilter = () => {
    const matching = new Set(filterProducts(products, { query: $('search').value, category: $('category').value }).map(p => p.id));
    document.querySelectorAll('[data-product-id]').forEach(card => { card.hidden = !matching.has(card.dataset.productId); });
    $('result-count').textContent = `${matching.size} candidate${matching.size === 1 ? '' : 's'}`;
    $('no-results').hidden = matching.size !== 0;
  };
  $('search').addEventListener('input', updateFilter); $('category').addEventListener('change', updateFilter);
  const renderComparison = () => {
    const panel = $('comparison'); panel.hidden = chosen.size === 0; panel.replaceChildren(); if (!chosen.size) return;
    const selected = products.filter(p => chosen.has(p.id));
    panel.append(el('h2', `Compare ${chosen.size} candidate${chosen.size === 1 ? '' : 's'}`), el('p', 'External dimensions only. Stock and delivery are unconfirmed; no live prices or personal test scores.'));
    const scroller = el('div', null, 'table-scroll'); scroller.tabIndex = 0; scroller.setAttribute('role', 'region'); scroller.setAttribute('aria-label', 'Product comparison; scroll horizontally on smaller screens');
    const table = el('table'); const head = el('thead'); const hr = el('tr'); const labelHead = el('th', 'Specification'); labelHead.scope = 'col'; hr.append(labelHead);
    selected.forEach(p => { const th = el('th', p.name); th.scope = 'col'; hr.append(th); }); head.append(hr); table.append(head);
    const body = el('tbody');
    for (const [label, get] of [['Manufacturer', p => p.merchantName], ['Width × depth × height', p => Object.values(p.dimensionsMM).join(' × ') + ' mm'], ['Minimum space height', p => p.minSpaceHeightMM ? p.minSpaceHeightMM + ' mm' : 'No separate minimum recorded'], ['Checked', p => p.source.checkedAt], ['Important limitation', p => p.caution]]) {
      const row = el('tr'); const th = el('th', label); th.scope = 'row'; row.append(th); selected.forEach(p => row.append(el('td', get(p)))); body.append(row);
    }
    table.append(body); scroller.append(table); panel.append(scroller);
  };
  document.querySelectorAll('[data-compare]').forEach(box => box.addEventListener('change', () => {
    if (box.checked && chosen.size >= 3) { box.checked = false; $('compare-message').textContent = 'Comparison is limited to three candidates. Deselect one to add another.'; return; }
    if (box.checked) chosen.add(box.dataset.compare); else chosen.delete(box.dataset.compare);
    $('compare-message').textContent = `${chosen.size} selected. Choose up to three candidates to compare.`; renderComparison();
  }));
}
async function initFit() {
  const products = await catalogue();
  $('fit-form').addEventListener('submit', event => {
    event.preventDefault(); const result = $('fit-result');
    try {
      const p = products.find(x => x.id === $('fit-product').value); if (!p) throw new Error('Select a valid candidate.');
      const fit = checkFit(p, { width: $('width').value, depth: $('depth').value, height: $('height').value }, { clearanceMM: $('clearance').value, allowRotation: $('rotate').checked });
      result.replaceChildren(el('p', fit.fits ? 'Dimensions pass this screen.' : 'This space does not pass.', `result-status ${fit.fits ? 'result-success' : 'result-fail'}`), el('p', `${p.name}${fit.rotated ? ' · Turned 90° on its base.' : ''}`), el('p', `Required clear height: ${fit.requiredHeight} mm. Width/depth clearance is added once per axis.`), el('p', p.caution), el('p', fit.caveat, 'small'));
    } catch (error) { showError(result, error); }
  });
}
function initOps() {
  $('scenario-form').addEventListener('submit', event => {
    event.preventDefault(); const target = $('scenario-result');
    try {
      const values = {}; for (const id of ['visits', 'outboundRate', 'conversionRate', 'basketEUR', 'commissionRate', 'reversalRate', 'costsEUR']) { if ($(id).value === '') throw new Error('Complete every assumption.'); values[id] = Number($(id).value) / (id.endsWith('Rate') ? 100 : 1); }
      const s = estimateScenario(values);
      target.replaceChildren(el('strong', 'HYPOTHETICAL RESULT — NOT ACTUAL INCOME'), el('p', `${s.clicks.toLocaleString('en-IE')} outbound clicks · ${s.purchases.toLocaleString('en-IE')} expected eligible purchases`), el('p', `Gross commission: ${euro(s.grossEUR)}. After assumed reversals: ${euro(s.netCommissionEUR)}.`), el('p', `After entered costs, before tax and labour: ${euro(s.beforeTaxEUR)}.`), el('p', `Expected commission per outbound click: ${euro(s.expectedCommissionPerClickEUR)}. Not an advertising budget or a forecast.`));
    } catch (error) { showError(target, error); }
  });
  $('ledger-file').addEventListener('change', async event => {
    const target = $('ledger-result');
    try {
      const file = event.target.files[0]; if (!file) { target.textContent = 'No statement selected.'; return; } if (file.size > 5_000_000) throw new Error('File exceeds the 5 MB local viewer limit.');
      const totals = summariseLedger(JSON.parse(await file.text()));
      target.replaceChildren(el('strong', 'IMPORTED REPORT — NOT BANK-RECONCILED'), el('p', `${totals.transactions} transactions. Pending: ${euro(totals.pendingCents / 100)}. Approved but unpaid: ${euro(totals.approvedUnpaidCents / 100)}.`), el('p', `Paid gross: ${euro(totals.paidGrossCents / 100)}. Paid-then-reversed: ${euro(totals.clawbackCents / 100)}. Report-based net: ${euro(totals.cashNetCents / 100)}.`), el('p', 'No data has been uploaded or saved. Check statements against real receipts.'));
    } catch (error) { showError(target, error); }
  });
}
const page = document.body.dataset.page;
try { await initProductMedia(); if (page === 'catalogue') await initCatalogue(); if (page === 'fit') await initFit(); if (page === 'ops') initOps(); }
catch (error) { const target = $('fit-result') || $('result-count') || $('ledger-result'); if (target) showError(target, error); }
