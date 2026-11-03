import { chromium } from 'playwright';
import path from 'path';
import { pathToFileURL } from 'url';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
await p.goto(pathToFileURL(path.resolve('admin-v3-source/content-admin.html')).href);
await p.locator('#loginF').waitFor();
const info = await p.evaluate(() => {
  const i = document.querySelector('#ln');
  const s = getComputedStyle(i);
  const card = document.querySelector('.lcard');
  const h1 = document.querySelector('.lcard h1');
  const cs = getComputedStyle(card), hs = getComputedStyle(h1);
  return { border: s.borderTopWidth, radius: s.borderRadius, height: s.height, minHeight: s.minHeight, padding: s.padding, cardW: Math.round(card.getBoundingClientRect().width), cardPad: cs.padding, h1w: hs.fontWeight, h1s: hs.fontSize, html: document.querySelector('#loginF').outerHTML.slice(0,600) };
});
console.log(JSON.stringify(info, null, 2));
await b.close();
