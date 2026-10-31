import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const shots = [
  { url: '/', w: 1024, h: 900, name: 'home-1024-viewport' },
  { url: '/contact', w: 360, h: 780, name: 'contact-360-top' },
  { url: '/contact', w: 768, h: 900, name: 'contact-768-top' },
  { url: '/about', w: 768, h: 900, name: 'about-768-top' },
];
for (const s of shots) {
  const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000' + s.url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `.tmp-resp/${s.name}.png` });
  await ctx.close();
  console.log('shot', s.name);
}
await browser.close();
