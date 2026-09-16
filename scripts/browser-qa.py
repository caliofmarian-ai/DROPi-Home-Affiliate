"""Optional UI validation. Requires an already-running local preview and installed Playwright.
Run: python scripts/browser-qa.py http://127.0.0.1:4173 /mnt/data/qa-output
Append --offline to render local build bytes without navigation. In offline mode,
CSS/JS are injected and the catalogue fetch is substituted with local build data.
This tests DOM interactions, NOT browser HTTP, CSP or ES-module loading.
Not part of the zero-dependency Node application. No external site is opened.
"""
import json, os, re, shutil, sys
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
base = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:4173'
out = Path(sys.argv[2] if len(sys.argv) > 2 else 'private/browser-qa'); out.mkdir(parents=True, exist_ok=True)
offline = '--offline' in sys.argv
root = Path(__file__).resolve().parents[1]
checks, errors, external_requests = [], [], []
def check(name, value):
    checks.append({'check':name,'pass':bool(value)})
    if not value: raise AssertionError(name)
with sync_playwright() as p:
    executable = os.environ.get('CHROMIUM_EXECUTABLE') or shutil.which('chromium')
    browser = p.chromium.launch(headless=True, executable_path=executable, args=['--no-sandbox'])
    context = browser.new_context(viewport={'width':390,'height':844}, device_scale_factor=1, is_mobile=True, has_touch=True)
    page = context.new_page()
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('request', lambda req: external_requests.append(req.url) if urlparse(req.url).netloc != urlparse(base).netloc else None)
    def visit(route):
        if not offline:
            response = page.goto(base + route, wait_until='networkidle')
            check('HTTP 200 ' + route, response.status == 200)
            return
        html = (root / 'dist' / route.strip('/') / 'index.html').read_text()
        html = re.sub(r'<link[^>]+rel="stylesheet"[^>]*>', '', html)
        html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.S)
        page.set_content(html)
        page.add_style_tag(content=(root / 'public/styles.css').read_text())
        data = json.loads((root / 'dist/catalogue.json').read_text())
        page.evaluate('(data) => { window.fetch = async () => ({ok:true, json:async () => data}); }', data)
        logic = (root / 'public/logic.js').read_text().replace('export ', '')
        app = re.sub(r'^import .*?;\n', '', (root / 'public/app.js').read_text())
        page.evaluate('(async () => {' + logic + '\n' + app + '\n})()')
        check('Offline built page rendered ' + route, True)
    for route in ['/', '/guides/', '/catalogue/', '/fit/', '/about/', '/privacy/', '/disclosure/', '/ops/', '/guides/measure-drawer/']:
        visit(route)
        check('No mobile horizontal overflow '+route,page.evaluate('document.documentElement.scrollWidth <= innerWidth'))
        check('One H1 '+route,page.locator('h1').count()==1)
        check('Main landmark '+route,page.locator('main').count()==1)
    visit('/catalogue/')
    page.locator('#search').fill('SKUBB')
    check('Search returns three SKUBB candidates',page.locator('[data-product-id]:visible').count()==3)
    page.locator('#search').fill('parkla')
    check('Accent-insensitive search',page.locator('[data-product-id]:visible').count()==1)
    page.locator('#category').select_option('drawer')
    check('Empty state appears',page.locator('#no-results').is_visible())
    page.locator('#search').fill('');page.locator('#category').select_option('all')
    for i in range(3): page.locator('[data-compare]').nth(i).check()
    check('Comparison shows three candidate columns',page.locator('#comparison thead th').count()==4)
    page.locator('[data-compare]').nth(3).click()
    check('Fourth compare rejected',not page.locator('[data-compare]').nth(3).is_checked())
    check('Comparison keeps mobile page within viewport',page.evaluate('document.documentElement.scrollWidth <= innerWidth'))
    visit('/fit/')
    page.locator('#fit-product').select_option('drawerstore-compact')
    for k,v in {'width':'130','depth':'420','height':'70'}.items():page.locator('#'+k).fill(v)
    page.get_by_role('button',name='Check the dimensions').click()
    check('Manufacturer minimum height blocks low drawer','does not pass' in page.locator('#fit-result').inner_text())
    page.locator('#height').fill('80');page.get_by_role('button',name='Check the dimensions').click()
    check('Adequate height passes geometric screen','pass this screen' in page.locator('#fit-result').inner_text())
    page.screenshot(path=str(out/'fit-mobile.png'),full_page=True)
    visit('/ops/')
    page.get_by_role('button',name='Calculate the scenario').click()
    check('Hypothetical scenario returns 400 gross and 360 pre-tax','€400.00' in page.locator('#scenario-result').inner_text() and '€360.00' in page.locator('#scenario-result').inner_text())
    check('Scenario is labelled hypothetical','HYPOTHETICAL' in page.locator('#scenario-result').inner_text())
    ledger={'schemaVersion':1,'records':[{'provider':'synthetic','transactionId':'demo','commissionCents':400,'currency':'EUR','everPaid':True,'status':'PAID'}]}
    page.locator('#ledger-file').set_input_files({'name':'synthetic-ledger.json','mimeType':'application/json','buffer':json.dumps(ledger).encode()})
    page.wait_for_function("document.querySelector('#ledger-result').textContent.includes('€4.00')")
    check('Local report viewer separates paid values','€4.00' in page.locator('#ledger-result').inner_text())
    if not offline: check('No local storage',page.evaluate('localStorage.length')==0)
    check('No cookies',len(context.cookies())==0)
    visit('/');page.screenshot(path=str(out/'home-mobile.png'),full_page=True)
    page.set_viewport_size({'width':1440,'height':1000});visit('/');page.screenshot(path=str(out/'home-desktop.png'),full_page=True)
    check('No desktop horizontal overflow',page.evaluate('document.documentElement.scrollWidth <= innerWidth'))
    check('No page script errors',not errors);check('No third-party resource requests',not external_requests)
    report={'mode':'offline built HTML + CSS + application JS; catalogue fetch substituted with local build data' if offline else 'live local HTTP', 'browser':'Chromium via Playwright on Linux','browserVersion':browser.version,'physicalAndroidTested':False,'checks':checks,'passed':sum(x['pass'] for x in checks),'errors':errors,'externalRequests':external_requests}
    (out/'browser-qa.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({'passed':report['passed'],'errors':errors,'externalRequests':external_requests}))
    browser.close()
