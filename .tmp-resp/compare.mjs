import { chromium } from '@playwright/test';
import fs from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

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
fs.mkdirSync('.tmp-resp/after', { recursive: true });
fs.mkdirSync('.tmp-resp/shot360', { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
async function prep() {
  await page.addStyleTag({ content: `*, *::before, *::after { animation: none !important; transition: none !important; } nextjs-portal { display: none !important; }` });
}
for (const [name, path] of pages) {
  await page.goto('http://localhost:3000' + path, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.querySelectorAll('nextjs-portal').forEach((n) => n.remove()));
  await prep();
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.75;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `.tmp-resp/after/${name}.png`, fullPage: true });
  const dims = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth, sh: document.body.scrollHeight }));
  console.log('after', name, dims);
}

// 360 screenshots for visual review
const mctx = await browser.newContext({ viewport: { width: 360, height: 800 }, deviceScaleFactor: 1 });
const mp = await mctx.newPage();
for (const [name, path] of pages) {
  await mp.goto('http://localhost:3000' + path, { waitUntil: 'networkidle' });
  await mp.evaluate(() => document.querySelectorAll('nextjs-portal').forEach((n) => n.remove()));
  await mp.addStyleTag({ content: `*, *::before, *::after { animation: none !important; transition: none !important; } nextjs-portal { display: none !important; }` });
  await mp.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await mp.waitForTimeout(600);
  await mp.screenshot({ path: `.tmp-resp/shot360/${name}.png`, fullPage: true });
}
await browser.close();

// pixel diff 1440
for (const [name] of pages) {
  const a = `.tmp-resp/base/${name}.png`;
  const b = `.tmp-resp/after/${name}.png`;
  if (!fs.existsSync(a) || !fs.existsSync(b)) {
    console.log('diff', name, 'missing');
    continue;
  }
  const imgA = PNG.sync.read(fs.readFileSync(a));
  const imgB = PNG.sync.read(fs.readFileSync(b));
  if (imgA.width !== imgB.width || imgA.height !== imgB.height) {
    console.log('diff', name, `SIZE ${imgA.width}x${imgA.height} -> ${imgB.width}x${imgB.height}`);
    continue;
  }
  const { width, height } = imgA;
  const diff = new PNG({ width, height });
  const bad = pixelmatch(imgA.data, imgB.data, diff.data, width, height, { threshold: 0.12 });
  const pct = ((bad / (width * height)) * 100).toFixed(3);
  fs.writeFileSync(`.tmp-resp/after/${name}.diff.png`, PNG.sync.write(diff));
  console.log('diff', name, `bad=${bad} (${pct}%)`);
}
