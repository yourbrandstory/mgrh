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
  for (let i = 0; i < 20; i++) {
    await p.goto(BASE + '/admin/' + t, { waitUntil: 'networkidle' });
    const names = await p.locator('main span[class*="nameText"]').allInnerTexts();
    const bad = names.find((n) => /^QA\b/.test(n));
    if (!bad) break;
    const row = p.locator('main div[class*="listRow"]').filter({ has: p.locator('span[class*="nameText"]', { hasText: bad }) }).first();
    await row.getByRole('button', { name: 'Edit', exact: true }).click();
    await p.waitForTimeout(700);
    await p.getByRole('button', { name: 'Delete this record' }).click();
    await p.getByRole('button', { name: 'Delete permanently' }).click();
    await p.waitForTimeout(1500);
    console.log('deleted', t, bad);
  }
  const names = await p.locator('main span[class*="nameText"]').allInnerTexts();
  console.log(t, 'remaining', names.filter((n) => /^QA\b/.test(n)).length, '/', names.length);
}
await b.close();
