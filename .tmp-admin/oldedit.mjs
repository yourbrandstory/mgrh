import { chromium } from '@playwright/test';
const base = 'http://localhost:3100';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const p = await ctx.newPage();
const errs = [];
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto(base + '/admin-ui/index.html', { waitUntil: 'networkidle' });
await p.waitForTimeout(1200);
await p.fill('input[type=email]', 'mgrh@admin.com');
await p.fill('input[type=password]', 'admin123');
await p.click('button[type=submit]');
await p.waitForTimeout(3500);
const nav = async (label) => {
  await p.evaluate((l) => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === l); if (b) b.click(); }, label);
  await p.waitForTimeout(800);
};
for (const [label, name] of [['Doctors', 'doctor-edit'], ['Facilities', 'facility-edit'], ['Events', 'event-edit']]) {
  await nav(label);
  const clicked = await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Edit'); if (b) { b.click(); return true; } return false; });
  if (!clicked) console.log('no Edit button for ' + label);
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `.tmp-admin/shots/old-${name}-1440.png`, fullPage: true });
}
console.log('ERRORS', JSON.stringify(errs));
await browser.close();
