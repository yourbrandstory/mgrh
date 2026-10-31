import { chromium } from '@playwright/test';
import fs from 'fs';
const pages = [
  ['home', '/'], ['emergency', '/emergency'], ['contact', '/contact'], ['support', '/support'],
  ['events', '/events'], ['programmes', '/programmes'], ['doctors', '/doctors'],
  ['facilities', '/facilities'], ['about', '/about'],
];
const width = Number(process.argv[2] || 360);
const height = width <= 479 ? 800 : 900;
fs.mkdirSync(`.tmp-resp/shot${width}`, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
for (const [name, path] of pages) {
  await page.goto('http://localhost:3000' + path, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.querySelectorAll('nextjs-portal').forEach((n) => n.remove()));
  await page.addStyleTag({ content: `*, *::before, *::after { animation: none !important; transition: none !important; } nextjs-portal { display: none !important; }` });
  await page.waitForTimeout(700);
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.6);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 220)));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `.tmp-resp/shot${width}/${name}.png`, fullPage: true });
  const dims = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, sh: document.body.scrollHeight }));
  console.log(width, name, dims);
}
await browser.close();
