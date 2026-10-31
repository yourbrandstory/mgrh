import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
const r = await page.evaluate(() => {
  const nav = document.querySelector('header nav div[class*="navLinks"]');
  const links = Array.from(nav.querySelectorAll('a'));
  return {
    navClient: nav.clientWidth,
    navScroll: nav.scrollWidth,
    links: links.map(a => ({ t: a.textContent, w: Math.round(a.getBoundingClientRect().width), fs: getComputedStyle(a).fontSize, pad: getComputedStyle(a).padding })),
    logo: Math.round(document.querySelector('header img').getBoundingClientRect().width),
    emg: Math.round(document.querySelector('header a[class*="emergencyBtn"], header button[class*="emergencyBtn"]').getBoundingClientRect().width),
  };
});
console.log(JSON.stringify(r, null, 1));
await browser.close();
