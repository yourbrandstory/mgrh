import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
await p.goto('http://localhost:3000/admin/login');
await p.locator('#loginF').waitFor();
await p.waitForTimeout(300);
console.log(await p.locator('#loginF').boundingBox());
console.log(await p.evaluate(() => [...document.querySelectorAll('#loginF > *')].map(e => ({ tag:e.tagName, cls:e.className, h:Math.round(e.getBoundingClientRect().height), text:(e.textContent||'').slice(0,40) }))));
await b.close();
