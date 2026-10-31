import { chromium } from '@playwright/test';
import fs from 'fs';

const base = 'http://localhost:3100';
const out = '.tmp-admin/shots';
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));

await page.goto(base + '/admin', { waitUntil: 'networkidle' });
await page.screenshot({ path: out + '/01-login-1440.png', fullPage: true });

await page.fill('input[type=email]', 'mgrh@admin.com');
await page.fill('input[type=password]', 'admin123');
await Promise.all([page.waitForURL('**/admin', { timeout: 30000 }), page.click('button[type=submit]')]);
await page.waitForTimeout(2500);
await page.screenshot({ path: out + '/02-dashboard-1440.png', fullPage: true });

const routes = [
  ['/admin/doctors', '03-doctors'],
  ['/admin/facilities', '04-facilities'],
  ['/admin/events', '05-events'],
  ['/admin/media', '06-media'],
  ['/admin/settings', '07-settings'],
  ['/admin/doctors/new', '08-doctor-new'],
];
for (const [path, name] of routes) {
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: out + `/${name}-1440.png`, fullPage: true });
}

await page.setViewportSize({ width: 1024, height: 900 });
for (const [path, name] of routes) {
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: out + `/${name}-1024.png`, fullPage: true });
}

console.log('URL', page.url());
console.log('CONSOLE ERRORS:', JSON.stringify(errors, null, 2));
await browser.close();
