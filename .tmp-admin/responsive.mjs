import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const BASE = 'http://localhost:3100';
const EMAIL = 'mgrh@admin.com';
const PASS = 'admin123';
const TS = Date.now().toString().slice(-6);
const NAME = 'QA Rsp ' + TS;
const SHOTS = path.resolve('.tmp-admin/shots-rsp');
fs.mkdirSync(SHOTS, { recursive: true });
const PHOTO = path.resolve('public/admin-assets/photo-corridor.png');

const results = [];
const consoleErrors = [];
function ok(name, extra = '') {
  results.push({ name, pass: true, extra });
  console.log('PASS  ' + name + (extra ? '  [' + extra + ']' : ''));
}
function fail(name, extra = '') {
  results.push({ name, pass: false, extra });
  console.log('FAIL  ' + name + (extra ? '  [' + extra + ']' : ''));
}
async function check(name, fn) {
  try {
    await fn();
    ok(name);
  } catch (e) {
    fail(name, e.message.split('\n')[0]);
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const browser = await chromium.launch();
const errors = [];

async function loginPage(page) {
  await page.goto(BASE + '/admin/login', { waitUntil: 'networkidle' });
  await page.fill('input[type=email]', EMAIL);
  await page.fill('input[type=password]', PASS);
  await Promise.all([page.waitForURL(BASE + '/admin', { timeout: 30000 }), page.locator('button[type=submit]').click()]);
  await page.getByText('Dashboard', { exact: true }).first().waitFor({ state: 'visible', timeout: 20000 });
}

async function noHScroll(page) {
  return page.evaluate(() => {
    const d = document.documentElement;
    const b = document.body;
    return Math.max(d.scrollWidth, b.scrollWidth) <= window.innerWidth + 1;
  });
}

async function shot(page, name) {
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: false });
}

async function fullShot(page, name) {
  await page.waitForTimeout(350);
  await page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true });
}

const WIDTHS = [1440, 1024, 768, 390, 360];

// ---------- login screens (logged out) ----------
for (const w of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w === 1440 ? 1000 : w <= 479 ? 780 : 900 } });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errors.push('login ' + w + ': ' + e.message));
  await p.goto(BASE + '/admin/login', { waitUntil: 'networkidle' });
  await check('login ' + w + ' fits width', async () => {
    assert(await noHScroll(p), 'page scrolls horizontally');
    const box = await p.locator('form').boundingBox();
    assert(box.width <= Math.min(440, w - 32) + 1, 'form is ' + Math.round(box.width) + 'px wide');
    if (w <= 1023) {
      const art = await p.locator('h1').first().boundingBox();
      assert(!art, 'illustration panel still visible');
    }
  });
  await shot(p, 'login-' + w);
  if (w === 1440) await fullShot(p, 'login-1440-full');
  await ctx.close();
}

// ---------- signed-in context ----------
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text());
});
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
await loginPage(page);

// ---------- 1440 screenshots for parity ----------
const parity = [
  ['02-dashboard-1440', '/admin'],
  ['03-doctors-1440', '/admin/doctors'],
  ['04-facilities-1440', '/admin/facilities'],
  ['05-events-1440', '/admin/events'],
  ['06-media-1440', '/admin/media'],
  ['07-settings-1440', '/admin/settings'],
];
for (const [name, url] of parity) {
  await page.goto(BASE + url, { waitUntil: 'networkidle' });
  await check('1440 no h-scroll ' + url, async () => {
    assert(await noHScroll(page), 'horizontal scroll');
  });
  await fullShot(page, name);
}
await page.goto(BASE + '/admin/doctors/new', { waitUntil: 'networkidle' });
await fullShot(page, '08-doctor-new-1440');
await check('1440 topbar hidden, sidebar visible', async () => {
  assert(!(await page.locator('button[aria-label="Open menu"]').isVisible()), 'topbar visible at 1440');
  const sb = await page.locator('aside').boundingBox();
  assert(sb && sb.x === 0 && sb.width > 200, 'sidebar not at left');
});

// ---------- dashboard / lists / forms / media / settings at each width ----------
for (const w of WIDTHS) {
  await page.setViewportSize({ width: w, height: w <= 479 ? 780 : 900 });
  await page.goto(BASE + '/admin', { waitUntil: 'networkidle' });
  await check('dashboard ' + w + ' no h-scroll', async () => {
    assert(await noHScroll(page), 'horizontal scroll');
  });
  if (w <= 1023) {
    await check('dashboard ' + w + ' mobile shell', async () => {
      const btn = page.locator('button[aria-label="Open menu"]');
      assert(await btn.isVisible(), 'hamburger missing');
      const b = await btn.boundingBox();
      assert(b.width >= 44 && b.height >= 44, 'hamburger ' + Math.round(b.width) + 'x' + Math.round(b.height));
      const sb = await page.locator('aside').boundingBox();
      assert(sb && sb.x + sb.width <= 1, 'sidebar still on screen');
      const search = await page.locator('header input[type=search]').boundingBox();
      assert(search.width >= w - 40, 'search is only ' + Math.round(search.width));
      const site = page.locator('button[aria-label="View website"]');
      const sbb = await site.boundingBox();
      assert(sbb.width === 44 && sbb.height === 44, 'view-site button ' + Math.round(sbb.width) + 'x' + Math.round(sbb.height));
    });
  }
  await shot(page, 'dash-' + w);

  for (const t of ['doctors', 'facilities', 'events']) {
    await page.goto(BASE + '/admin/' + t, { waitUntil: 'networkidle' });
    await check(t + ' ' + w + ' no h-scroll', async () => {
      assert(await noHScroll(page), 'horizontal scroll');
    });
    if (w <= 767) {
      await check(t + ' ' + w + ' rows are cards', async () => {
        assert(!(await page.locator('main button[aria-label="Move up"]').first().isVisible()), 'order buttons still visible');
        const more = page.locator('main button[aria-label="More actions"]').first();
        assert(await more.isVisible(), 'row menu button missing');
        const mb = await more.boundingBox();
        assert(mb.width >= 44 && mb.height >= 44, 'row menu ' + Math.round(mb.width) + 'x' + Math.round(mb.height));
        const name = page.locator('main').getByText(t === 'doctors' ? 'Dr.' : '', { exact: false }).first();
        void name;
        const search = await page.locator('main input[type=search]').boundingBox();
        assert(search.width >= w - 76, 'search not full width: ' + Math.round(search.width));
      });
    } else if (w === 1024) {
      await check(t + ' ' + w + ' keeps table', async () => {
        assert(await page.locator('main button[aria-label="Move up"]').first().isVisible(), 'table rows missing');
      });
    }
    await shot(page, t + '-' + w);
  }

  for (const f of ['doctors', 'facilities', 'events']) {
    await page.goto(BASE + '/admin/' + f + '/new', { waitUntil: 'networkidle' });
    await check(f + ' new ' + w + ' no h-scroll', async () => {
      assert(await noHScroll(page), 'horizontal scroll');
    });
    if (w <= 1023) {
      await check(f + ' new ' + w + ' stacked fields + panel above', async () => {
        const secs = await page.locator('main section').all();
        const titles = await page.locator('main h3').allInnerTexts();
        const pi = titles.indexOf('Publishing');
        const bi = titles.findIndex((x) => x.startsWith('Basic information') || x.startsWith('Facility details') || x.startsWith('Event details'));
        assert(pi >= 0 && bi >= 0, 'section titles not found');
        const pBox = await secs[pi].boundingBox();
        const bBox = await secs[bi].boundingBox();
        assert(pBox.y < bBox.y, 'publishing panel is below the fields');
        const grid = await page.locator('main section').nth(bi).locator('div').first().evaluate((el) => getComputedStyle(el).gridTemplateColumns);
        assert(grid.split(' ').length === 1, 'field grid columns: ' + grid);
      });
    }
    if (w <= 767) {
      await check(f + ' new ' + w + ' save bar + inputs', async () => {
        const bar = page.locator('div[class*="saveBar"]').first();
        assert((await bar.count()) > 0, 'save bar missing');
        const bb = await bar.boundingBox();
        assert(Math.abs(bb.y + bb.height - (w <= 479 ? 780 : 900)) < 2, 'save bar not fixed to bottom: ' + Math.round(bb.y + bb.height));
        const first = page.locator('main input[type=text]').first();
        const m = await first.evaluate((el) => {
          const cs = getComputedStyle(el);
          return { h: parseFloat(cs.height), fs: parseFloat(cs.fontSize) };
        });
        assert(m.h >= 46 && m.fs >= 16, 'input ' + m.h + 'px / ' + m.fs + 'px');
      });
    }
    await shot(page, f + '-new-' + w);
  }

  await page.goto(BASE + '/admin/media', { waitUntil: 'networkidle' });
  await check('media ' + w + ' no h-scroll', async () => {
    assert(await noHScroll(page), 'horizontal scroll');
  });
  await check('media ' + w + ' column count', async () => {
    const cols = await page.locator('main div[class*="mediaGrid"]').first().evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length);
    const want = w <= 767 ? 2 : w <= 1023 ? 3 : w <= 1279 ? 4 : 4;
    assert(cols === want, 'got ' + cols + ' columns, wanted ' + want);
  });
  await shot(page, 'media-grid-' + w);
  await page.getByRole('button', { name: 'List', exact: true }).click();
  await page.waitForTimeout(300);
  await check('media list ' + w + ' no h-scroll', async () => {
    assert(await noHScroll(page), 'horizontal scroll');
  });
  await shot(page, 'media-list-' + w);

  await page.goto(BASE + '/admin/settings', { waitUntil: 'networkidle' });
  await check('settings ' + w + ' no h-scroll', async () => {
    assert(await noHScroll(page), 'horizontal scroll');
  });
  if (w <= 767) {
    await check('settings ' + w + ' team cards + role pill', async () => {
      const row = page.locator('div[class*="teamRow"]').first();
      const style = await row.evaluate((el) => {
        const cs = getComputedStyle(el);
        return { radius: parseFloat(cs.borderRadius), border: parseFloat(cs.borderTopWidth) };
      });
      assert(style.radius >= 10 && style.border >= 1, 'team row is not a card');
      const pill = row.locator('span[class*="teamRole"]');
      assert(await pill.isVisible(), 'role pill missing');
      const pb = await pill.boundingBox();
      assert(pb.height >= 20, 'role pill too small');
    });
  }
  if (w <= 479) {
    await check('settings ' + w + ' backup buttons full width', async () => {
      const btn = page.getByRole('button', { name: 'Download backup' });
      const bb = await btn.boundingBox();
      const row = await page.locator('div[class*="backupRow"]').boundingBox();
      assert(Math.abs(bb.width - row.width) < 2, 'button ' + Math.round(bb.width) + ' of ' + Math.round(row.width));
    });
  }
  await shot(page, 'settings-' + w);
}

// ---------- drawer behaviour ----------
for (const w of [1023, 768, 390]) {
  await page.setViewportSize({ width: w, height: w <= 479 ? 780 : 900 });
  await page.goto(BASE + '/admin', { waitUntil: 'networkidle' });
  await check('drawer ' + w + ' opens, locks scroll, closes on Esc', async () => {
    await page.locator('button[aria-label="Open menu"]').click();
    await page.waitForTimeout(400);
    const sb = await page.locator('aside').boundingBox();
    assert(sb.x >= -1, 'drawer not open (x=' + Math.round(sb.x) + ')');
    assert(await page.locator('div[aria-hidden="true"]').first().isVisible(), 'backdrop missing');
    const overflow = await page.evaluate(() => document.body.style.overflow);
    assert(overflow === 'hidden', 'body scroll not locked');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const sb2 = await page.locator('aside').boundingBox();
    assert(sb2.x < -100, 'drawer did not close on Esc');
    const overflow2 = await page.evaluate(() => document.body.style.overflow);
    assert(overflow2 !== 'hidden', 'body scroll still locked');
  });
  await check('drawer ' + w + ' backdrop + link close', async () => {
    await page.locator('button[aria-label="Open menu"]').click();
    await page.waitForTimeout(350);
    await page.locator('div[aria-hidden="true"]').first().click({ position: { x: 10, y: 10 } }).catch(async () => {
      await page.mouse.click(w - 10, 300);
    });
    await page.waitForTimeout(400);
    const sb = await page.locator('aside').boundingBox();
    assert(sb.x < -100, 'drawer did not close on backdrop');
    await page.locator('button[aria-label="Open menu"]').click();
    await page.waitForTimeout(350);
    await page.locator('aside').getByText('Doctors', { exact: true }).click();
    await page.waitForTimeout(700);
    assert(page.url().includes('/admin/doctors'), 'link did not navigate');
    const sb2 = await page.locator('aside').boundingBox();
    assert(sb2.x < -100, 'drawer stayed open after navigation');
  });
}

// ---------- media preview bottom sheet ----------
await page.setViewportSize({ width: 390, height: 780 });
await page.goto(BASE + '/admin/media', { waitUntil: 'networkidle' });
await check('media preview is a bottom sheet at 390', async () => {
  await page.locator('main button[aria-label="Preview"]').first().click();
  await page.waitForTimeout(400);
  const dialog = page.locator('div[role="dialog"]').first();
  const box = await dialog.boundingBox();
  assert(Math.abs(box.y + box.height - 780) < 2, 'sheet not anchored to bottom');
  assert(box.height <= 780 * 0.85 + 2, 'sheet taller than 85vh');
  const handle = page.locator('div[class*="sheetHandle"]').first();
  assert(await handle.isVisible(), 'drag handle missing');
});
await shot(page, 'media-sheet-390');
await page.locator('div[role="dialog"]').getByRole('button', { name: 'Close' }).click();
await page.waitForTimeout(300);

// ---------- cropper ----------
for (const w of [768, 390]) {
  await page.setViewportSize({ width: w, height: w <= 479 ? 780 : 900 });
  await page.goto(BASE + '/admin/doctors/new', { waitUntil: 'networkidle' });
  await check('cropper ' + w + ' fits and zooms', async () => {
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.getByRole('button', { name: 'Upload image' }).click()]);
    await chooser.setFiles(PHOTO);
    const canvas = page.locator('canvas');
    await canvas.waitFor({ state: 'visible', timeout: 20000 });
    const card = await page.locator('div[role="dialog"]').first().boundingBox();
    assert(card.width <= w - 24 + 1, 'modal ' + Math.round(card.width) + 'px wide');
    const cb = await canvas.boundingBox();
    const dialogBody = await page.locator('div[role="dialog"]').first().boundingBox();
    assert(cb.x + cb.width <= dialogBody.x + dialogBody.width, 'canvas overflows modal');
    await page.getByRole('button', { name: 'Zoom in' }).click();
    await page.getByRole('button', { name: 'Zoom in' }).click();
    const pct = await page.locator('text=/1[0-9][0-9]%|2[0-9][0-9]%/').first().innerText();
    assert(/%$/.test(pct), 'zoom label missing');
    // drag
    await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2);
    await page.mouse.down();
    await page.mouse.move(cb.x + cb.width / 2 + 30, cb.y + cb.height / 2 + 20, { steps: 5 });
    await page.mouse.up();
    assert(await noHScroll(page), 'horizontal scroll with cropper open');
  });
  await shot(page, 'cropper-' + w);
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.waitForTimeout(300);
}

// ---------- mobile CRUD at 390 ----------
await page.setViewportSize({ width: 390, height: 780 });
await page.goto(BASE + '/admin/doctors', { waitUntil: 'networkidle' });
await check('mobile add + publish + delete', async () => {
  await page.getByRole('button', { name: '+ Add doctor' }).click();
  await page.waitForTimeout(600);
  await page.locator('main input[type=text]').first().fill(NAME);
  await page.locator('main input[placeholder="e.g. Medical Officer"]').fill('QA Mobile Officer');
  await page.locator('main select').first().selectOption({ index: 1 });
  const save = page.locator('div[class*="saveBar"] button', { hasText: 'Publish' });
  await save.click();
  await page.locator('[role="status"]').filter({ hasText: 'Published' }).waitFor({ state: 'visible', timeout: 20000 });
  const toastBox = await page.locator('[role="status"]').first().boundingBox();
  const barBox = await page.locator('div[class*="saveBar"]').first().boundingBox();
  assert(toastBox.y + toastBox.height <= barBox.y + 1, 'toast overlaps the save bar');
  assert(Math.abs(toastBox.width - (390 - 32)) < 3, 'toast is ' + Math.round(toastBox.width) + 'px wide');
  await page.waitForFunction(() => /\/admin\/doctors\/[^/]+$/.test(location.pathname), null, { timeout: 20000 });
  // public site
  const pub = await context.newPage();
  await pub.goto(BASE + '/doctors', { waitUntil: 'networkidle' });
  const body = await pub.locator('body').innerText();
  assert(body.includes(NAME), 'published doctor not on the public page');
  await pub.close();
  // back to list, unpublish + delete via the row menu
  await page.goto(BASE + '/admin/doctors', { waitUntil: 'networkidle' });
  const card = page.locator('main div[class*="listRow"]').filter({ hasText: NAME }).first();
  await card.locator('button[aria-label="More actions"]').click();
  await card.getByRole('button', { name: 'Unpublish' }).click();
  await page.locator('[role="status"]').filter({ hasText: /hidden from the website/ }).waitFor({ state: 'visible', timeout: 20000 });
  await card.locator('button[aria-label="More actions"]').click();
  await card.getByRole('button', { name: 'Delete' }).click();
  await page.waitForTimeout(400);
  const dlg = page.locator('div[role="alertdialog"]');
  const db = await dlg.boundingBox();
  assert(db.width <= 390 - 32 + 1, 'confirm is ' + Math.round(db.width) + 'px wide');
  const confirmBtn = dlg.getByRole('button', { name: /Remove|Delete/i }).last();
  const cancelBtn = dlg.getByRole('button', { name: 'Cancel' });
  const cb1 = await confirmBtn.boundingBox();
  const cb2 = await cancelBtn.boundingBox();
  assert(cb1.y < cb2.y, 'primary button is not first when stacked');
  await shot(page, 'confirm-390');
  await confirmBtn.click();
  await page.waitForTimeout(800);
  await page.goto(BASE + '/admin/doctors', { waitUntil: 'networkidle' });
  assert(!(await page.locator('main').innerText()).includes(NAME), 'record still in the list after delete');
  const pub2 = await context.newPage();
  await pub2.goto(BASE + '/doctors', { waitUntil: 'networkidle' });
  const body2 = await pub2.locator('body').innerText();
  assert(!body2.includes(NAME), 'record still on the public page');
  await pub2.close();
});

// ---------- 1440 pixel parity ----------
const pairs = [
  ['01-login-1440', 'login-1440-full'],
  ['02-dashboard-1440', '02-dashboard-1440'],
  ['03-doctors-1440', '03-doctors-1440'],
  ['04-facilities-1440', '04-facilities-1440'],
  ['05-events-1440', '05-events-1440'],
  ['06-media-1440', '06-media-1440'],
  ['07-settings-1440', '07-settings-1440'],
  ['08-doctor-new-1440', '08-doctor-new-1440'],
];
for (const [before, after] of pairs) {
  await check('1440 parity ' + after, async () => {
    const a = PNG.sync.read(fs.readFileSync(path.join('.tmp-admin/shots', before + '.png')));
    const b = PNG.sync.read(fs.readFileSync(path.join(SHOTS, after + '.png')));
    if (a.width !== b.width || a.height !== b.height) throw new Error('size differs ' + a.width + 'x' + a.height + ' vs ' + b.width + 'x' + b.height);
    const diff = new PNG({ width: a.width, height: a.height });
    const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.12 });
    fs.writeFileSync(path.join(SHOTS, 'diff-' + after + '.png'), PNG.sync.write(diff));
    const pct = (100 * n) / (a.width * a.height);
    if (pct > 0.25) throw new Error(pct.toFixed(2) + '% pixels differ');
  });
}

await browser.close();

console.log('\nConsole errors: ' + consoleErrors.length);
consoleErrors.slice(0, 10).forEach((e) => console.log('  ' + e));
console.log('Page errors: ' + errors.length);
errors.slice(0, 10).forEach((e) => console.log('  ' + e));
const fails = results.filter((r) => !r.pass);
console.log('\n' + (results.length - fails.length) + '/' + results.length + ' checks passed');
process.exit(fails.length || errors.length ? 1 : 0);
