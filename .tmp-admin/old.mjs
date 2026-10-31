import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const p = await ctx.newPage();
await p.goto('http://localhost:3100/admin-ui/index.html', { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);
await p.screenshot({ path: '.tmp-admin/shots/old-login-1440.png', fullPage: true });
try {
  await p.fill('input[type=email]', 'mgrh@admin.com');
  await p.fill('input[type=password]', 'admin123');
  await p.click('button[type=submit]');
  await p.waitForTimeout(4000);
  await p.screenshot({ path: '.tmp-admin/shots/old-dash-1440.png', fullPage: true });
  await p.evaluate(() => { const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='Doctors'); if(b) b.click(); });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: '.tmp-admin/shots/old-doctors-1440.png', fullPage: true });
} catch (e) { console.log('ERR', e.message); }
await browser.close();
