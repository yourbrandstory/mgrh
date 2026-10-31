import { chromium } from '@playwright/test';

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
const widths = [1440, 1280, 1024, 768, 390, 360];

const browser = await chromium.launch();
const results = [];

for (const width of widths) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const [name, path] of pages) {
    await page.goto('http://localhost:3000' + path, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.querySelectorAll('nextjs-portal').forEach((n) => n.remove()));
    await page.addStyleTag({ content: `*, *::before, *::after { animation: none !important; transition: none !important; } nextjs-portal { display: none !important; }` });
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.8;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 80));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(400);
    let modal = null;
    if (name === 'emergency') {
      try {
        await page.waitForSelector('[class*="modalOverlay"]', { timeout: 6000, state: 'visible' });
        modal = await page.evaluate(() => {
          const overlay = document.querySelector('[class*="modalOverlay"]');
          const panel = overlay && overlay.firstElementChild;
          const r = panel && panel.getBoundingClientRect();
          return {
            open: true,
            iw: window.innerWidth,
            sw: document.documentElement.scrollWidth,
            panelW: r ? Math.round(r.width) : 0,
            panelH: r ? Math.round(r.height) : 0,
            vh: window.innerHeight,
          };
        });
      } catch {
        modal = { open: false };
      }
      await page.keyboard.press('Escape');
      await page.waitForTimeout(250);
    }
    const data = await page.evaluate(() => {
      const iw = window.innerWidth;
      const de = document.documentElement;
      const offenders = [];
      for (const el of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') continue;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        if (r.right > iw + 1 || r.left < -1) {
          let p = el.parentElement;
          let scrollable = false;
          while (p) {
            const ps = getComputedStyle(p);
            if ((ps.overflowX === 'auto' || ps.overflowX === 'scroll') && p.scrollWidth > p.clientWidth + 1) {
              scrollable = true;
              break;
            }
            p = p.parentElement;
          }
          if (!scrollable) {
            offenders.push({
              tag: el.tagName,
              cls: String(el.className || '').slice(0, 50),
              left: Math.round(r.left),
              right: Math.round(r.right),
              w: Math.round(r.width),
            });
          }
        }
      }
      const small = [];
      const seen = new Set();
      for (const el of document.querySelectorAll('a[href], button')) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const r = el.getBoundingClientRect();
        if (r.width < 1) continue;
        if (r.height < 44 || r.width < 44) {
          const where = el.closest('header') ? 'header' : el.closest('footer') ? 'footer' : 'main';
          const text = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 28);
          const w = Math.round(r.width);
          const h = Math.round(r.height);
          const key = `${where}|${text}|${w}|${h}`;
          if (seen.has(key)) continue;
          seen.add(key);
          small.push({ where, text, w, h });
        }
      }
      return {
        iw,
        sw: de.scrollWidth,
        bsw: document.body.scrollWidth,
        offenders: offenders.slice(0, 12),
        small: small.slice(0, 20),
        smallCount: small.length,
      };
    });

    // Mobile menu check
    let menu = null;
    if (width <= 1023) {
      const btn = await page.$('button[aria-controls="site-mobile-nav"]');
      if (btn) {
        await btn.click();
        await page.waitForTimeout(250);
        menu = await page.evaluate(() => {
          const panel = document.getElementById('site-mobile-nav');
          if (!panel) return { open: false };
          const links = Array.from(panel.querySelectorAll('a'));
          return {
            open: true,
            sw: document.documentElement.scrollWidth,
            iw: window.innerWidth,
            panelRight: Math.round(panel.getBoundingClientRect().right),
            fonts: links.map((l) => getComputedStyle(l).fontSize),
            linkHeights: links.map((l) => Math.round(l.getBoundingClientRect().height)),
            count: links.length,
          };
        });
        await page.keyboard.press('Escape');
        await page.waitForTimeout(150);
      } else {
        menu = { open: false, missing: true };
      }
    }

    results.push({ width, name, ...data, menu, modal });
  }
  await ctx.close();
}
await browser.close();

for (const r of results) {
  const ok = r.sw <= r.iw && r.offenders.length === 0;
  const menuInfo = r.menu
    ? r.menu.missing
      ? ' MENU-MISSING'
      : ` menu=${r.menu.open ? 'open' : 'closed'} fonts=${(r.menu.fonts || []).join(',')} heights=${(r.menu.linkHeights || []).join(',')} panelRight=${r.menu.panelRight}`
    : '';
  const modalInfo = r.modal
    ? ` modal=${r.modal.open ? `w${r.modal.panelW}xh${r.modal.panelH}/${r.modal.iw}x${r.modal.vh}` : 'none'}`
    : '';
  console.log(
    `${String(r.width).padEnd(5)} ${r.name.padEnd(11)} ${ok ? 'PASS' : 'FAIL'} sw=${r.sw} iw=${r.iw} offenders=${r.offenders.length} small=${r.smallCount}${menuInfo}${modalInfo}`,
  );
}
console.log('\n--- details ---');
for (const r of results) {
  if (r.offenders.length) console.log(r.width, r.name, 'OVERFLOW', JSON.stringify(r.offenders));
  if (r.smallCount && r.small.length && r.width <= 1023) console.log(r.width, r.name, 'SMALL', JSON.stringify(r.small));
  if (r.menu && r.menu.sw && r.menu.sw > r.menu.iw) console.log(r.width, r.name, 'MENU-OVERFLOW', JSON.stringify(r.menu));
}
