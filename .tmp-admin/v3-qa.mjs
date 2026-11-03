import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const APP = 'http://localhost:3000';
const EMAIL = 'mgrh@admin.com';
const PASS = 'admin123';
const TS = Date.now().toString().slice(-6);
const NAME = 'QA Doctor ' + TS;
const NAME2 = NAME + ' Renamed';
const PHOTO = path.resolve('public/admin-assets/photo-corridor.png');
const SHOTS = path.resolve('.tmp-admin/shots-v3');
const PROTO = pathToFileURL(path.resolve('admin-v3-source/content-admin.html')).href;
fs.mkdirSync(SHOTS, { recursive: true });

const results = [];
const pageErrors = [];
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
async function check(name, fn) {
  try {
    await fn();
    results.push({ name, pass: true });
    console.log('PASS  ' + name);
  } catch (e) {
    results.push({ name, pass: false, extra: e.message.split('\n')[0] });
    console.log('FAIL  ' + name + '  [' + e.message.split('\n')[0] + ']');
    throw e;
  }
}
async function noHScroll(page) {
  return page.evaluate(() => {
    const d = document.documentElement;
    const b = document.body;
    return Math.max(d.scrollWidth, b.scrollWidth) <= window.innerWidth + 1;
  });
}
async function shot(page, name, full = false) {
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: full });
}
async function waitRows(page) {
  await page.locator('.rows .row').first().waitFor({ state: 'visible', timeout: 20000 });
  await page.waitForTimeout(200);
}
async function toast(page, text) {
  const el = page.locator('#toasts .toast').filter({ hasText: text }).last();
  await el.waitFor({ state: 'visible', timeout: 20000 });
  return el;
}
async function publicHas(browser, text) {
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  try {
    await p.goto(APP + '/doctors', { waitUntil: 'domcontentloaded' });
    await p.waitForLoadState('networkidle').catch(() => {});
    return (await p.locator('body').innerText()).includes(text);
  } finally {
    await ctx.close();
  }
}
async function metrics(page) {
  return page.evaluate(() => {
    const one = (s) => {
      const el = document.querySelector(s);
      if (!el) return null;
      const c = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        w: Math.round(r.width),
        h: Math.round(r.height),
        font: c.fontSize,
        pad: c.padding,
        gap: c.gap,
        grid: c.gridTemplateColumns,
      };
    };
    return { side: one('.side'), main: one('.main'), head: one('.pagehead'), h1: one('.pagehead h1'), tabs: one('.tabs'), row: one('.rows .row'), nav: one('.nav') };
  });
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
page.on('pageerror', (e) => pageErrors.push('PAGEERROR ' + e.message));
page.on('console', (m) => {
  if (m.type() === 'error') pageErrors.push('CONSOLE ' + m.text());
});
const badResponses = [];
page.on('response', (r) => {
  if (r.status() >= 400) badResponses.push(r.status() + ' ' + r.url());
});

let created = false;
let rowId = '';
let uploadedPath = '';

try {
  await check('Login screen renders at 1440 without horizontal scroll', async () => {
    await page.goto(APP + '/admin/login', { waitUntil: 'networkidle' });
    assert(await page.locator('input[type=email]').isVisible(), 'email input missing');
    assert(await page.locator('input[type=password]').isVisible(), 'password input missing');
    assert(!(await page.locator('body').innerText()).includes('Prototype sign-in'), 'prototype sign-in line still present');
    assert(await noHScroll(page), 'horizontal scroll on login');
    await shot(page, 'app-login-1440');
  });

  await check('Sign in with Supabase account', async () => {
    await page.fill('input[type=email]', EMAIL);
    await page.fill('input[type=password]', PASS);
    await Promise.all([
      page.waitForURL(APP + '/admin/doctors', { timeout: 30000 }),
      page.locator('button[type=submit]').click(),
    ]);
    await page.getByRole('heading', { name: 'Doctors', exact: true }).waitFor({ timeout: 20000 });
    const body = await page.locator('body').innerText();
    assert(body.includes('Content admin'), 'sidebar missing');
    assert(!body.includes('Dashboard') && !body.includes('Media Library') && !body.includes('Settings'), 'old admin navigation still present');
  });

  await check('Doctors list at 1440', async () => {
    await waitRows(page);
    assert(await noHScroll(page), 'horizontal scroll');
    await shot(page, 'app-doctors-1440', true);
  });
  const appMetrics = await metrics(page);

  await check('Doctors tabs stay in the URL', async () => {
    await page.getByRole('tab', { name: 'Support staff' }).click();
    await page.waitForFunction(() => new URL(location.href).searchParams.get('tab') === 'support', null, { timeout: 15000 });
    assert((await page.getByRole('tab', { name: 'Support staff' }).getAttribute('aria-selected')) === 'true', 'tab not selected');
    await shot(page, 'app-support-1440', true);
    await page.getByRole('tab', { name: 'Doctors', exact: true }).click();
    await page.waitForFunction(() => {
      const tab = new URL(location.href).searchParams.get('tab');
      return tab === null || tab === 'list';
    }, null, { timeout: 15000 });
  });

  await check('Facilities list + sections tab at 1440', async () => {
    await page.goto(APP + '/admin/facilities', { waitUntil: 'networkidle' });
    await waitRows(page);
    assert(await noHScroll(page), 'horizontal scroll');
    await shot(page, 'app-facilities-1440', true);
    await page.getByRole('tab', { name: 'Sections' }).click();
    await page.waitForFunction(() => new URL(location.href).searchParams.get('tab') === 'sections', null, { timeout: 15000 });
    await page.waitForTimeout(400);
    await shot(page, 'app-sections-1440', true);
  });

  await check('Events list + categories tab at 1440', async () => {
    await page.goto(APP + '/admin/events', { waitUntil: 'networkidle' });
    await waitRows(page);
    assert(await noHScroll(page), 'horizontal scroll');
    await shot(page, 'app-events-1440', true);
    await page.getByRole('tab', { name: 'Categories' }).click();
    await page.waitForFunction(() => new URL(location.href).searchParams.get('tab') === 'categories', null, { timeout: 15000 });
    await page.waitForTimeout(400);
    await shot(page, 'app-categories-1440', true);
  });

  await check('Add doctor drawer validation', async () => {
    await page.goto(APP + '/admin/doctors', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Add doctor' }).click();
    const drawer = page.getByRole('dialog', { name: 'Add a doctor' });
    await drawer.waitFor({ timeout: 10000 });
    await drawer.getByRole('button', { name: 'Save', exact: true }).click();
    const alert = drawer.getByRole('alert');
    await alert.waitFor({ timeout: 5000 });
    assert((await alert.innerText()).includes('Please enter the doctor’s name.'), 'wrong validation message');
    await shot(page, 'app-doctor-drawer-1440');
  });

  await check('Doctor: add with cropped photo + publish', async () => {
    const drawer = page.getByRole('dialog', { name: 'Add a doctor' });
    await drawer.locator('#f-name').fill(NAME);
    await drawer.locator('#f-role').fill('QA Medical Officer');
    await drawer.locator('#f-spec').selectOption({ label: 'Medicine' }).catch(() => {});
    await drawer.locator('#f-sch').fill('QA tagline for testing');

    const [chooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 15000 }),
      drawer.getByRole('button', { name: 'Add photo' }).click(),
    ]);
    await chooser.setFiles(PHOTO);
    const editor = page.getByRole('dialog', { name: 'Adjust photo' });
    await editor.waitFor({ timeout: 20000 });
    await page.waitForTimeout(700);
    await shot(page, 'app-image-editor-1440');
    await editor.getByRole('button', { name: 'Zoom in' }).click();
    await editor.locator('#edalt').fill('QA doctor photo');
    await editor.getByRole('button', { name: 'Save photo' }).click();
    await editor.waitFor({ state: 'detached', timeout: 20000 });
    await drawer.locator('.imgbox img').waitFor({ state: 'visible', timeout: 10000 });

    await drawer.getByRole('button', { name: 'Save', exact: true }).click();
    await toast(page, 'Saved. The website now shows your changes.');
    created = true;
    const row = page.locator('.rows .row').filter({ hasText: NAME });
    await row.waitFor({ timeout: 20000 });
    rowId = (await row.getAttribute('data-id')) || '';
    assert(rowId, 'new row has no id');
  });

  await check('Doctor appears on public /doctors with a Storage image', async () => {
    const pubCtx = await browser.newContext();
    const pub = await pubCtx.newPage();
    try {
      await pub.goto(APP + '/doctors', { waitUntil: 'networkidle' });
      const body = await pub.locator('body').innerText();
      assert(body.includes(NAME), 'doctor missing on public page');
      const srcs = await pub.locator('img').evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src') || ''));
      const url = srcs.find((src) => src.includes('/storage/v1/object/public/media/'));
      assert(url, 'no Storage image URL on public doctors page');
      const res = await pubCtx.request.get(url);
      assert(res.status() === 200, 'Storage object returned ' + res.status());
      uploadedPath = decodeURIComponent(url.split('/object/public/media/')[1] || '');
      assert(uploadedPath.startsWith('cms/doctor/'), 'unexpected upload path: ' + uploadedPath);
    } finally {
      await pubCtx.close();
    }
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const res = await fetch(
      url + '/rest/v1/media?select=storage_path,mime_type,size_bytes&storage_path=eq.' + encodeURIComponent(uploadedPath),
      { headers: { apikey: key, Authorization: 'Bearer ' + key } },
    );
    assert(res.status === 200, 'media query returned ' + res.status);
    const rows = await res.json();
    assert(rows.length === 1, 'expected one media row, got ' + rows.length);
    assert(rows[0].mime_type === 'image/jpeg' && Number(rows[0].size_bytes) > 0, 'media row is not a JPEG');
  });

  await check('Doctor: edit name', async () => {
    const row = page.locator(`.rows .row[data-id="${rowId}"]`);
    await row.getByRole('button', { name: 'Edit' }).click();
    const drawer = page.getByRole('dialog', { name: 'Edit doctor' });
    await drawer.locator('#f-name').fill(NAME2);
    await drawer.getByRole('button', { name: 'Save', exact: true }).click();
    await toast(page, 'Saved. The website now shows your changes.');
    await page.locator(`.rows .row[data-id="${rowId}"]`).filter({ hasText: NAME2 }).waitFor({ timeout: 20000 });
    assert(await publicHas(browser, NAME2), 'edited doctor missing on public page');
  });

  await check('Doctor: hide + show', async () => {
    let row = page.locator(`.rows .row[data-id="${rowId}"]`);
    await row.getByRole('switch').click();
    await toast(page, 'Hidden from the website.');
    await page.waitForTimeout(500);
    assert(!(await publicHas(browser, NAME2)), 'hidden doctor still public');
    row = page.locator(`.rows .row[data-id="${rowId}"]`);
    await row.getByRole('switch').click();
    await toast(page, 'Now shown on the website.');
    await page.waitForTimeout(500);
    assert(await publicHas(browser, NAME2), 'shown doctor missing from public page');
  });

  await check('Doctor: reorder and restore order', async () => {
    const ids = () => page.locator('.rows .row').evaluateAll((rows) => rows.map((r) => r.getAttribute('data-id')));
    const before = await ids();
    const at = before.indexOf(rowId);
    assert(at > 0, 'QA doctor is not movable');
    await page.locator(`.rows .row[data-id="${rowId}"]`).getByRole('button', { name: 'Move up' }).click();
    await page.waitForFunction(
      ({ id, index }) => {
        const rows = [...document.querySelectorAll('.rows .row')].map((r) => r.getAttribute('data-id'));
        return rows.indexOf(id) === index - 1;
      },
      { id: rowId, index: at },
      { timeout: 15000 },
    );
    await page.locator(`.rows .row[data-id="${rowId}"]`).getByRole('button', { name: 'Move down' }).click();
    await page.waitForFunction(
      ({ id, index }) => {
        const rows = [...document.querySelectorAll('.rows .row')].map((r) => r.getAttribute('data-id'));
        return rows.indexOf(id) === index;
      },
      { id: rowId, index: at },
      { timeout: 15000 },
    );
  });

  await check('Doctor: delete + undo, then delete permanently', async () => {
    await page.locator(`.rows .row[data-id="${rowId}"]`).getByRole('button', { name: 'Delete', exact: true }).click();
    const dialog = page.getByRole('alertdialog');
    await dialog.waitFor();
    await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
    const deleted = await toast(page, 'Deleted “' + NAME2 + '”.');
    await page.locator(`.rows .row[data-id="${rowId}"]`).waitFor({ state: 'detached', timeout: 15000 });
    assert(!(await publicHas(browser, NAME2)), 'deleted doctor still public');
    await deleted.getByRole('button', { name: 'Undo' }).click();
    await toast(page, 'Restored.');
    await page.locator(`.rows .row[data-id="${rowId}"]`).waitFor({ timeout: 15000 });

    await page.locator(`.rows .row[data-id="${rowId}"]`).getByRole('button', { name: 'Delete', exact: true }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Delete', exact: true }).click();
    await toast(page, 'Deleted “' + NAME2 + '”.');
    await page.locator(`.rows .row[data-id="${rowId}"]`).waitFor({ state: 'detached', timeout: 15000 });
    created = false;
  });

  await check('Facility drawer + save (migration pending)', async () => {
    await page.goto(APP + '/admin/facilities', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Add facility' }).click();
    const drawer = page.getByRole('dialog', { name: 'Add a facility' });
    await drawer.waitFor();
    await drawer.locator('#f-name').fill('QA Facility ' + TS);
    await drawer.locator('#f-desc').fill('QA description for the facility drawer.');
    await shot(page, 'app-facility-drawer-1440');
    await drawer.getByRole('button', { name: 'Save', exact: true }).click();
    const alert = drawer.getByRole('alert');
    await alert.waitFor({ timeout: 20000 });
    const text = await alert.innerText();
    assert(/column|schema cache/i.test(text), 'unexpected facility error: ' + text);
    await shot(page, 'app-facility-error-1440');
    await drawer.getByRole('button', { name: 'Cancel' }).click();
    const discard = page.getByRole('alertdialog');
    await discard.waitFor();
    await discard.getByRole('button', { name: 'Discard' }).click();
    await drawer.waitFor({ state: 'detached' });
  });

  await check('Event drawer + save (migration pending)', async () => {
    await page.goto(APP + '/admin/events', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Add event' }).click();
    const drawer = page.getByRole('dialog', { name: 'Add an event' });
    await drawer.waitFor();
    await drawer.locator('#f-title').fill('QA Event ' + TS);
    await drawer.locator('#f-loc').fill('QA venue');
    await shot(page, 'app-event-drawer-1440');
    await drawer.getByRole('button', { name: 'Save', exact: true }).click();
    const alert = drawer.getByRole('alert');
    await alert.waitFor({ timeout: 20000 });
    const text = await alert.innerText();
    assert(/column|schema cache/i.test(text), 'unexpected event error: ' + text);
    await shot(page, 'app-event-error-1440');
    await drawer.getByRole('button', { name: 'Cancel' }).click();
    const discard = page.getByRole('alertdialog');
    await discard.waitFor();
    await discard.getByRole('button', { name: 'Discard' }).click();
    await drawer.waitFor({ state: 'detached' });
  });

  // ---------- 390 px ----------
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [name, route] of [
    ['doctors', '/admin/doctors'],
    ['facilities', '/admin/facilities'],
    ['events', '/admin/events'],
  ]) {
    await check(name + ' at 390: no horizontal scroll + bottom nav', async () => {
      await page.goto(APP + route, { waitUntil: 'networkidle' });
      await waitRows(page);
      assert(await noHScroll(page), 'horizontal scroll at 390');
      const side = await page.locator('.side').boundingBox();
      assert(side && Math.abs(side.y + side.height - 844) < 2, 'sidebar is not the bottom bar');
      const brand = await page.locator('.side > .brandrow').evaluate((el) => getComputedStyle(el).display);
      assert(brand === 'none', 'brand row still visible on mobile');
      await shot(page, `app-${name}-390`, true);
    });
  }

  await check('Doctor drawer at 390', async () => {
    await page.goto(APP + '/admin/doctors', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Add doctor' }).click();
    const drawer = page.getByRole('dialog', { name: 'Add a doctor' });
    await drawer.waitFor();
    const box = await drawer.boundingBox();
    assert(box.width <= 390 + 1, 'drawer wider than viewport');
    assert(await noHScroll(page), 'drawer causes horizontal scroll');
    await shot(page, 'app-doctor-drawer-390');
    await drawer.getByRole('button', { name: 'Cancel' }).click();
  });

  await check('Facility and event drawers at 390', async () => {
    await page.goto(APP + '/admin/facilities', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Add facility' }).click();
    await page.getByRole('dialog', { name: 'Add a facility' }).waitFor();
    assert(await noHScroll(page), 'facility drawer causes horizontal scroll');
    await shot(page, 'app-facility-drawer-390');
    await page.getByRole('dialog', { name: 'Add a facility' }).getByRole('button', { name: 'Cancel' }).click();

    await page.goto(APP + '/admin/events', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Add event' }).click();
    await page.getByRole('dialog', { name: 'Add an event' }).waitFor();
    assert(await noHScroll(page), 'event drawer causes horizontal scroll');
    await shot(page, 'app-event-drawer-390');
    await page.getByRole('dialog', { name: 'Add an event' }).getByRole('button', { name: 'Cancel' }).click();
  });

  // ---------- prototype reference screenshots ----------
  const protoMetrics = {};
  for (const width of [1440, 390]) {
    const pctx = await browser.newContext({ viewport: { width, height: width === 1440 ? 1000 : 844 } });
    const proto = await pctx.newPage();
    proto.on('pageerror', (e) => pageErrors.push('PROTO PAGEERROR ' + e.message));
    await proto.goto(PROTO, { waitUntil: 'load' });
    await proto.waitForTimeout(500);
    await shot(proto, 'proto-login-' + width);
    await proto.fill('#ln', 'Hospital staff');
    await proto.click('#loginF button[type=submit]');
    await proto.waitForSelector('.shell', { timeout: 10000 });
    await proto.waitForTimeout(300);
    await shot(proto, 'proto-doctors-' + width, true);
    if (width === 1440) protoMetrics.doctors = await metrics(proto);

    await proto.locator('button[data-a="nav"][data-v="facilities"]').click();
    await proto.waitForTimeout(300);
    await shot(proto, 'proto-facilities-' + width, true);
    await proto.locator('button[data-a="nav"][data-v="events"]').click();
    await proto.waitForTimeout(300);
    await shot(proto, 'proto-events-' + width, true);

    await proto.locator('button[data-a="nav"][data-v="doctors"]').click();
    await proto.getByRole('tab', { name: 'Support staff' }).click();
    await proto.waitForTimeout(250);
    await shot(proto, 'proto-support-' + width, true);
    await proto.getByRole('tab', { name: 'Doctors', exact: true }).click();
    await proto.locator('button[data-a="add"][data-t="doctors"]').click();
    await proto.waitForTimeout(300);
    await shot(proto, 'proto-doctor-drawer-' + width);
    await proto.keyboard.press('Escape');
    await pctx.close();
  }

  console.log('\nAPP METRICS 1440: ' + JSON.stringify(appMetrics));
  console.log('PROTO METRICS 1440: ' + JSON.stringify(protoMetrics.doctors));
} catch (e) {
  console.log('STOPPED: ' + e.message);
  await page.screenshot({ path: path.join(SHOTS, 'failure.png'), fullPage: true }).catch(() => {});
} finally {
  if (created) {
    try {
      await page.goto(APP + '/admin/doctors', { waitUntil: 'networkidle' });
      const row = page.locator('.rows .row').filter({ hasText: NAME2 });
      if (await row.count()) {
        await row.getByRole('button', { name: 'Delete', exact: true }).click();
        await page.getByRole('alertdialog').getByRole('button', { name: 'Delete', exact: true }).click();
        await page.waitForTimeout(1000);
      }
      console.log('cleanup: removed QA doctor');
    } catch (e) {
      console.log('cleanup failed: ' + e.message);
    }
  }
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const headers = { apikey: key, Authorization: 'Bearer ' + key };
    const list = await fetch(url + '/rest/v1/media?select=id,storage_path&storage_path=like.cms/doctor/*', { headers });
    const rows = list.status === 200 ? await list.json() : [];
    const cutoff = Date.now() - 2 * 60 * 60 * 1000;
    let removed = 0;
    for (const row of rows) {
      const stamp = Number((row.storage_path.split('/').pop() || '').split('-')[0]);
      if (!(stamp > cutoff)) continue;
      await fetch(url + '/storage/v1/object/media/' + row.storage_path.split('/').map(encodeURIComponent).join('/'), {
        method: 'DELETE',
        headers,
      });
      await fetch(url + '/rest/v1/media?id=eq.' + row.id, { method: 'DELETE', headers });
      removed += 1;
    }
    if (removed) console.log('cleanup: removed ' + removed + ' QA upload(s)');
  } catch (e) {
    console.log('upload cleanup failed: ' + e.message);
  }
  await browser.close();
  const fails = results.filter((r) => !r.pass);
  console.log('\n===== ' + (results.length - fails.length) + '/' + results.length + ' checks passed =====');
  console.log('Browser errors: ' + pageErrors.length);
  pageErrors.slice(0, 20).forEach((e) => console.log('  ' + e));
  console.log('HTTP >=400: ' + badResponses.length);
  [...new Set(badResponses)].slice(0, 20).forEach((e) => console.log('  ' + e));
  process.exit(fails.length ? 1 : 0);
}
