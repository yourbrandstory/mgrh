import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
await p.goto('http://localhost:3000/admin/login');
await p.locator('#loginF').waitFor();
await p.waitForTimeout(400);
await p.screenshot({ path: '.tmp-admin/shots-session/app-login-1440-v2.png' });
console.log(await p.locator('#loginF').boundingBox());
await b.close();
