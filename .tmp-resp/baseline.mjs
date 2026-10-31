import { chromium } from '@playwright/test';
import fs from 'fs';
const pages = [
  ['home', '/'],
  ['emergency', '/emergency'],
  ['contact', '/contact'],
  ['support', '/support'],
  ['events', '/events'],
  ['programmes', '/programmes'],
  ['doctors', '/doctors'],
  ['facilities', '/facilities'],
  ['about', '/about'],
];
fs.mkdirSync('.tmp-resp/base', { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
async function prep() {
  await page.addStyleTag({ content: `*, *::before, *::after { animation: none !important; transition: none !important; } nextjs-portal { display: none !important; }` });
}
for (const [name, path] of pages) {
  await page.goto('http://localhost:3000' + path, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.querySelectorAll('nextjs-portal').forEach(n => n.remove()));
  await prep();
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.75;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `.tmp-resp/base/${name}.png`, fullPage: true });
  const dims = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth, sh: document.body.scrollHeight }));
  console.log(name, dims);
}
await browser.close();
