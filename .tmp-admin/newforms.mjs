import { chromium } from '@playwright/test';
const base = 'http://localhost:3100';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const p = await ctx.newPage();
const errs = [];
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
p.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
await p.goto(base + '/admin/login', { waitUntil: 'networkidle' });
await p.fill('input[type=email]', 'mgrh@admin.com');
await p.fill('input[type=password]', 'admin123');
await Promise.all([p.waitForURL('**/admin'), p.click('button[type=submit]')]);
await p.waitForTimeout(2000);
for (const [path, name] of [['/admin/facilities/new', 'facility-new'], ['/admin/events/new', 'event-new']]) {
  await p.goto(base + path, { waitUntil: 'networkidle' });
  await p.waitForTimeout(900);
  await p.screenshot({ path: `.tmp-admin/shots/${name}-1440.png`, fullPage: true });
}
// edit forms: click first edit button on each list
for (const [path, name] of [['/admin/doctors', 'doctor-edit'], ['/admin/facilities', 'facility-edit'], ['/admin/events', 'event-edit']]) {
  await p.goto(base + path, { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  await p.locator('button', { hasText: 'Edit' }).first().click();
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `.tmp-admin/shots/${name}-1440.png`, fullPage: true });
}
await p.setViewportSize({ width: 1024, height: 900 });
for (const [path, name] of [['/admin', 'dashboard'], ['/admin/doctors', 'doctors'], ['/admin/facilities', 'facilities'], ['/admin/events', 'events'], ['/admin/media', 'media'], ['/admin/settings', 'settings'], ['/admin/doctors/new', 'doctor-new']]) {
  await p.goto(base + path, { waitUntil: 'networkidle' });
  await p.waitForTimeout(700);
  await p.screenshot({ path: `.tmp-admin/shots/${name}-1024.png`, fullPage: true });
}
console.log('ERRORS', JSON.stringify(errs));
await browser.close();
