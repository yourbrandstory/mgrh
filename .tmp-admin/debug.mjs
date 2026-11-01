import { chromium } from '@playwright/test';

const BASE = 'http://localhost:3100';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 780 } });
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
await page.goto(BASE + '/admin/login', { waitUntil: 'networkidle' });
await page.fill('input[type=email]', 'mgrh@admin.com');
await page.fill('input[type=password]', 'admin123');
await Promise.all([page.waitForURL(BASE + '/admin', { timeout: 30000 }), page.locator('button[type=submit]').click()]);
await page.goto(BASE + '/admin/settings', { waitUntil: 'networkidle' });
console.log('URL', page.url());
const html = await page.locator('main').innerHTML();
console.log('has teamRow?', html.includes('teamRow'), 'has teamInfo?', html.includes('teamInfo'), 'has teamRole?', html.includes('teamRole'));
const classes = await page.evaluate(() => Array.from(document.querySelectorAll('main *')).map((el) => el.className).filter((c) => typeof c === 'string' && c.includes('team')).slice(0, 10));
console.log(classes);
console.log('teamRow count', await page.locator('div[class*="teamRow"]').count());

// drawer at 1024
await page.setViewportSize({ width: 1024, height: 900 });
await page.goto(BASE + '/admin', { waitUntil: 'networkidle' });
const btn = page.locator('button[aria-label="Open menu"]');
console.log('hamburger count', await btn.count(), 'visible', await btn.isVisible().catch((e) => e.message));
const bb = await btn.boundingBox().catch(() => null);
console.log('hamburger box', bb);
const info = await btn.evaluate((el) => {
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
  return { r: { x: r.x, y: r.y, w: r.width, h: r.height }, display: cs.display, top: top ? top.tagName + '.' + top.className : null };
}).catch((e) => e.message);
console.log('hamburger info', info);
await browser.close();
