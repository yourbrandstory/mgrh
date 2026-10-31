import { chromium } from '@playwright/test';
const base = 'http://localhost:3100';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1024, height: 900 } });
const p = await ctx.newPage();
const errs = [];
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto(base + '/admin-ui/index.html', { waitUntil: 'networkidle' });
await p.waitForTimeout(1200);
await p.fill('input[type=email]', 'mgrh@admin.com');
await p.fill('input[type=password]', 'admin123');
await p.click('button[type=submit]');
await p.waitForTimeout(3500);
const shot = async (name) => { await p.waitForTimeout(500); await p.screenshot({ path: `.tmp-admin/shots/old1024-${name}.png`, fullPage: true }); };
const nav = async (label) => { await p.evaluate((l) => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === l); if (b) b.click(); }, label); await p.waitForTimeout(800); };
await shot('dashboard');
for (const [label, name] of [['Doctors', 'doctors'], ['Facilities', 'facilities'], ['Events', 'events'], ['Media Library', 'media'], ['Settings', 'settings']]) { await nav(label); await shot(name); }
for (const [label, name] of [['Doctors', 'doctor-new'], ['Facilities', 'facility-new'], ['Events', 'event-new']]) {
  await nav(label);
  await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim().startsWith('+ Add ')); if (b) b.click(); });
  await shot(name);
}
for (const [label, name] of [['Doctors', 'doctor-edit'], ['Facilities', 'facility-edit'], ['Events', 'event-edit']]) {
  await nav(label);
  await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Edit'); if (b) b.click(); });
  await shot(name);
}
console.log('ERRORS', JSON.stringify(errs));
await browser.close();
