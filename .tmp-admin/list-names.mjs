import { chromium } from '@playwright/test';
const BASE = 'http://localhost:3100';
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 1440, height: 1000 } });
const p = await c.newPage();
await p.goto(BASE + '/admin/login', { waitUntil: 'networkidle' });
await p.fill('input[type=email]', 'mgrh@admin.com');
await p.fill('input[type=password]', 'admin123');
await Promise.all([p.waitForURL(BASE + '/admin', { timeout: 30000 }), p.locator('button[type=submit]').click()]);
for (const t of ['doctors', 'facilities', 'events']) {
  await p.goto(BASE + '/admin/' + t, { waitUntil: 'networkidle' });
  const names = await p.locator('main span[class*="nameText"]').allInnerTexts();
  console.log(t, names);
}
await b.close();
