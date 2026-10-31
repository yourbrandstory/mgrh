import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 360, height: 800 } });
const page = await ctx.newPage();
await page.goto('http://localhost:3000/about', { waitUntil: 'networkidle' });
await page.waitForTimeout(1600);
const before = await page.evaluate(() => {
  const v = document.querySelector('[class*="visionCard"]');
  const m = document.querySelector('[class*="missionCard"]');
  return { v: v && getComputedStyle(v).opacity, m: m && getComputedStyle(m).opacity, vh: innerHeight };
});
console.log('before scroll', before);
const y = await page.evaluate(() => document.querySelector('[class*="visionCard"]')?.getBoundingClientRect().top + scrollY - 300);
await page.evaluate((y) => window.scrollTo(0, y), y);
await page.waitForTimeout(900);
const after = await page.evaluate(() => {
  const v = document.querySelector('[class*="visionCard"]');
  const m = document.querySelector('[class*="missionCard"]');
  const r = v?.getBoundingClientRect();
  return { v: v && getComputedStyle(v).opacity, m: m && getComputedStyle(m).opacity, rect: r && { top: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width) } };
});
console.log('after scroll', after);
await page.screenshot({ path: '.tmp-resp/probe-vm.png', fullPage: false });
await browser.close();
