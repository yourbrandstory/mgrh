import puppeteer from 'puppeteer-core';
import path from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const [mode, target, widthArg] = process.argv.slice(2);
const width = Number(widthArg || 1440);

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width, height: 1000 });

if (mode === 'file') {
  await page.goto('file:///' + path.resolve(target).replace(/\\/g, '/'), { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));
} else {
  await page.goto(target, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2500));
}

const sig = await page.evaluate(() => {
  const pick = ['fontSize', 'fontWeight', 'color', 'lineHeight', 'letterSpacing', 'textTransform', 'backgroundColor'];
  const out = [];
  const HEAD = new Set(['h1', 'h2', 'h3', 'h4']);
  const walk = (el) => {
    const cs = getComputedStyle(el);
    const tag = el.tagName.toLowerCase();
    const leaf = el.children.length === 0;
    const own = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    const wanted = HEAD.has(tag) || ['p', 'a', 'button', 'li', 'label', 'th', 'td'].includes(tag) || (leaf && ['span', 'div', 'strong', 'small'].includes(tag));
    if (wanted && own && cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0') {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) {
        for (const c of el.children) walk(c);
        return;
      }
      const s = { tag, own: own.slice(0, 80), w: Math.round(r.width) };
      for (const k of pick) s[k] = cs[k];
      out.push(s);
    }
    for (const c of el.children) walk(c);
  };
  walk(document.body);
  return out;
});

console.log(JSON.stringify(sig));
await browser.close();
