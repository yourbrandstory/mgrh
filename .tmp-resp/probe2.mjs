import { chromium } from '@playwright/test';
const browser = await chromium.launch();
for (const w of [1024, 1023, 768]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000/about', { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const t = document.querySelector('[class*="tlOuter"]');
    const m = document.querySelector('[class*="tlMobile"]');
    const h = document.querySelector('#history');
    return {
      tlOuter: t && getComputedStyle(t).display,
      tlMobile: m && getComputedStyle(m).display,
      historyH: h && Math.round(h.getBoundingClientRect().height),
      heroH: Math.round(document.querySelector('#who')?.getBoundingClientRect().height || 0),
    };
  });
  console.log(w, r);
  await ctx.close();
}
await browser.close();
