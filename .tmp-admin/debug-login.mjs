import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:3000/admin/login');
await p.waitForSelector('#ln');
const info = await p.evaluate(() => {
  const i = document.querySelector('#ln');
  const s = getComputedStyle(i);
  const matches = [...document.styleSheets].flatMap(sh => { try { return [...sh.cssRules]; } catch { return []; } })
    .filter(r => r.selectorText && r.selectorText.includes('input'))
    .map(r => ({ sel: r.selectorText, css: r.style.cssText }));
  return { border: s.border, borderWidth: s.borderTopWidth, radius: s.borderRadius, height: s.height, minHeight: s.minHeight, padding: s.padding, matches, hrefs: [...document.styleSheets].map(sh => sh.href) };
});
console.log(JSON.stringify(info, null, 2));
await b.close();
