import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const p = await ctx.newPage();
await p.goto('http://localhost:3100/admin-ui/index.html', { waitUntil: 'networkidle' });
await p.waitForTimeout(1200);
await p.fill('input[type=email]', 'mgrh@admin.com');
await p.fill('input[type=password]', 'admin123');
await p.click('button[type=submit]');
await p.waitForTimeout(3500);
const shot = async (name) => { await p.waitForTimeout(600); await p.screenshot({ path: `.tmp-admin/shots/old-${name}-1440.png`, fullPage: true }); };
const nav = async (label) => { await p.evaluate((l) => { const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()===l); if(b) b.click(); }, label); await p.waitForTimeout(700); };
for (const [label,name] of [['Facilities','facilities'],['Events','events'],['Media Library','media'],['Settings','settings']]) { await nav(label); await shot(name); }
for (const [label,name] of [['Doctors','doctor-new'],['Facilities','facility-new'],['Events','event-new']]) {
  await nav(label);
  await p.evaluate(() => { const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim().startsWith('+ Add ')); if(b) b.click(); });
  await shot(name);
}
await browser.close();
