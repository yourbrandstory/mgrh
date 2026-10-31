import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE = 'http://localhost:3100';
const EMAIL = 'mgrh@admin.com';
const PASS = 'admin123';
const TS = Date.now().toString().slice(-6);
const DOCTOR = 'QA Doctor ' + TS;
const DOCTOR2 = DOCTOR + ' Renamed';
const FACILITY = 'QA Facility ' + TS;
const FACILITY2 = FACILITY + ' Renamed';
const EVENT = 'QA Event ' + TS;
const EVENT2 = EVENT + ' Renamed';
const PHOTO_NAME = 'qa-photo-' + TS;
const PHOTO_SRC = path.resolve('public/admin-assets/photo-corridor.png');
const PHOTO_TMP = path.resolve('.tmp-admin', PHOTO_NAME + '.png');
fs.copyFileSync(PHOTO_SRC, PHOTO_TMP);

const results = [];
const errors = [];
let step = 'start';

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
    throw e;
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function waitToast(page, text, timeout = 20000) {
  const toast = page.locator('[role="status"]').filter({ hasText: text });
  await toast.first().waitFor({ state: 'visible', timeout });
}

async function login(page) {
  await page.goto(BASE + '/admin/login', { waitUntil: 'networkidle' });
  await page.fill('input[type=email]', EMAIL);
  await page.fill('input[type=password]', PASS);
  await Promise.all([
    page.waitForURL(BASE + '/admin', { timeout: 30000 }),
    page.locator('button[type=submit]').click(),
  ]);
  await page.getByText('Dashboard', { exact: true }).first().waitFor({ state: 'visible', timeout: 20000 });
}

async function publicBody(text) {
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  try {
    await p.goto(BASE + text, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await p.waitForLoadState('networkidle').catch(() => {});
    const body = await p.locator('body').innerText();
    const html = await p.content();
    return { body, html };
  } finally {
    await ctx.close();
  }
}

async function publicHas(pathname, text) {
  const { body } = await publicBody(pathname);
  return body.includes(text);
}

async function gotoEdit(page, url) {
  await page.goto(BASE + url, { waitUntil: 'networkidle' });
  await page.locator('h2').first().waitFor({ state: 'visible', timeout: 20000 });
  await page.waitForTimeout(500);
}

async function saveAndExpect(page, button, toastText, urlPattern) {
  await page.getByRole('button', { name: button, exact: true }).click();
  await waitToast(page, toastText);
  if (urlPattern) {
    await page.waitForFunction(
      (src) => new RegExp(src).test(location.pathname),
      urlPattern.source,
      { timeout: 20000 },
    );
  }
}

async function deleteCurrent(page) {
  await page.getByRole('button', { name: 'Delete this record', exact: true }).click();
  await page.getByRole('button', { name: 'Delete permanently', exact: true }).waitFor({ state: 'visible', timeout: 10000 });
  await page.getByRole('button', { name: 'Delete permanently', exact: true }).click();
  await waitToast(page, 'was deleted', 20000);
}

async function cleanupRecord(page, listPath, name) {
  try {
    await page.goto(BASE + listPath, { waitUntil: 'networkidle' });
    await page.waitForTimeout(900);
    const row = page
      .getByText(name, { exact: true })
      .locator('xpath=ancestor::div[.//button[normalize-space()="Delete"]][1]');
    if (!(await row.count())) return false;
    await row.getByRole('button', { name: 'Delete', exact: true }).click();
    await page.getByRole('button', { name: 'Delete permanently', exact: true }).click();
    await waitToast(page, 'was deleted', 20000);
    return true;
  } catch {
    return false;
  }
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));

let created = { doctor: false, facility: false, event: false };
let uploadedName = null;

try {
  // ---------- sign in / sign out ----------
  step = 'login';
  await check('Sign in with Supabase account', async () => {
    await login(page);
    const body = await page.locator('body').innerText();
    assert(body.includes('Dashboard') && body.includes('Media Library'), 'dashboard shell missing after sign in');
  });

  step = 'logout';
  await check('Sign out returns to /admin/login', async () => {
    await Promise.all([
      page.waitForURL(BASE + '/admin/login', { timeout: 20000 }),
      page.getByRole('button', { name: 'Log out', exact: true }).click(),
    ]);
  });

  step = 'login2';
  await check('Sign in again', async () => {
    await login(page);
  });

  // ---------- doctor ----------
  step = 'doctor-create-draft';
  await check('Doctor: add and save as draft', async () => {
    await gotoEdit(page, '/admin/doctors/new');
    const basic = page.locator('section').filter({ hasText: 'Basic information' });
    await basic.locator('input[type="text"]').first().fill(DOCTOR);
    await basic.locator('select').first().selectOption({ label: 'Medicine' });
    created.doctor = true;
    await saveAndExpect(page, 'Save draft', 'Draft saved. It is not visible on the website yet.', /\/admin\/doctors\/[^/]+$/);
    await page.waitForTimeout(700);
  });

  step = 'doctor-draft-public';
  await check('Doctor: draft absent from public /doctors', async () => {
    assert(!(await publicHas('/doctors', DOCTOR)), 'draft doctor found on public page');
  });

  step = 'doctor-publish';
  await check('Doctor: publish and appear on public /doctors', async () => {
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    await waitToast(page, 'Published. It is now visible on the website.');
    await page.waitForTimeout(800);
    assert(await publicHas('/doctors', DOCTOR), 'published doctor missing on public page');
  });

  step = 'doctor-edit';
  await check('Doctor: edit + Save changes appears on public /doctors', async () => {
    const basic = page.locator('section').filter({ hasText: 'Basic information' });
    await basic.locator('input[type="text"]').first().fill(DOCTOR2);
    await saveAndExpect(page, 'Save changes', 'Changes saved and live on the website.');
    await page.waitForTimeout(800);
    assert(await publicHas('/doctors', DOCTOR2), 'renamed doctor missing on public page');
  });

  step = 'doctor-unpublish';
  await check('Doctor: unpublish removes from public /doctors', async () => {
    await saveAndExpect(page, 'Unpublish', 'Unpublished. It has been removed from the website.');
    await page.waitForTimeout(800);
    assert(!(await publicHas('/doctors', DOCTOR2)), 'unpublished doctor still on public page');
  });

  step = 'doctor-delete';
  await check('Doctor: delete record', async () => {
    await deleteCurrent(page);
    created.doctor = false;
  });

  // ---------- facility ----------
  step = 'facility-create-draft';
  await check('Facility: add and save as draft', async () => {
    await gotoEdit(page, '/admin/facilities/new');
    const sec = page.locator('section').filter({ hasText: 'Facility details' });
    await sec.locator('input[type="text"]').first().fill(FACILITY);
    await sec.locator('select').first().selectOption({ label: 'Surgery' });
    await sec.locator('textarea').first().fill('QA short description for the facility.');
    created.facility = true;
    await saveAndExpect(page, 'Save draft', 'Draft saved. It is not visible on the website yet.', /\/admin\/facilities\/[^/]+$/);
    await page.waitForTimeout(700);
  });

  step = 'facility-draft-public';
  await check('Facility: draft absent from public /facilities', async () => {
    assert(!(await publicHas('/facilities', FACILITY)), 'draft facility found on public page');
  });

  step = 'facility-publish';
  await check('Facility: publish and appear on public /facilities', async () => {
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    await waitToast(page, 'Published. It is now visible on the website.');
    await page.waitForTimeout(800);
    assert(await publicHas('/facilities', FACILITY), 'published facility missing on public page');
  });

  step = 'facility-edit';
  await check('Facility: edit + Save changes appears on public /facilities', async () => {
    const sec = page.locator('section').filter({ hasText: 'Facility details' });
    await sec.locator('input[type="text"]').first().fill(FACILITY2);
    await saveAndExpect(page, 'Save changes', 'Changes saved and live on the website.');
    await page.waitForTimeout(800);
    assert(await publicHas('/facilities', FACILITY2), 'renamed facility missing on public page');
  });

  // ---------- photo upload via facility gallery ----------
  step = 'upload';
  let mediaUrl = '';
  await check('Upload photo: editor saves to Supabase Storage and Media Library', async () => {
    const [chooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 15000 }),
      page.getByRole('button', { name: 'Upload images', exact: true }).first().click(),
    ]);
    await chooser.setFiles(PHOTO_TMP);
    await page.getByRole('button', { name: 'Save image', exact: true }).waitFor({ state: 'visible', timeout: 20000 });
    await page.waitForTimeout(900);
    await page.getByRole('button', { name: 'Save image', exact: true }).click();
    await waitToast(page, 'Image ready. Save the record to keep this change.', 30000);
    uploadedName = PHOTO_NAME + '.jpg';
    await page.waitForTimeout(400);
    const galleryCount = await page.locator('section').filter({ hasText: 'Photos' }).locator('textarea, input[placeholder="Caption, e.g. General view"]').count();
    assert(galleryCount >= 1, 'uploaded image was not attached to the facility gallery');
  });

  step = 'upload-save-record';
  await check('Upload photo: saved record publishes image to public /facilities', async () => {
    await saveAndExpect(page, 'Save changes', 'Changes saved and live on the website.');
    await page.waitForTimeout(900);
  });

  step = 'upload-media-library';
  await check('Upload photo: appears in Media Library with Storage URL', async () => {
    await page.goto(BASE + '/admin/media', { waitUntil: 'networkidle' });
    await page.waitForTimeout(900);
    await page.getByRole('button', { name: 'List', exact: true }).click();
    const card = page
      .locator('div')
      .filter({ hasText: uploadedName })
      .filter({ has: page.getByRole('button', { name: 'Delete', exact: true }) })
      .last();
    await card.waitFor({ state: 'visible', timeout: 20000 });
    const bg = await card.locator('button[aria-label="Preview"]').first().evaluate((el) => getComputedStyle(el).backgroundImage);
    const m = bg.match(/url\("(.+)"\)/);
    assert(m && m[1], 'no storage URL on media card');
    mediaUrl = m[1];
    assert(mediaUrl.includes('/storage/v1/object/public/media/'), 'URL is not a Supabase Storage public URL: ' + mediaUrl);
    const res = await context.request.get(mediaUrl);
    assert(res.status() === 200, 'storage object fetch returned ' + res.status());
  });

  step = 'upload-public';
  await check('Upload photo: image URL is used on public /facilities', async () => {
    const { html, body } = await publicBody('/facilities');
    assert(body.includes(FACILITY2), 'facility missing on public page');
    assert(html.includes(mediaUrl), 'uploaded image URL not found on public facilities page');
  });

  step = 'media-delete-blocked';
  await check('Facility: delete record, then image becomes deletable', async () => {
    await page.goto(BASE + '/admin/facilities', { waitUntil: 'networkidle' });
    await page.waitForTimeout(900);
    await page.getByRole('button', { name: 'Edit', exact: true }).first().waitFor().catch(() => {});
    const row = page
      .getByText(FACILITY2, { exact: true })
      .locator('xpath=ancestor::div[.//button[normalize-space()="Delete"]][1]');
    await row.getByRole('button', { name: 'Delete', exact: true }).click();
    await page.getByRole('button', { name: 'Delete permanently', exact: true }).click();
    await waitToast(page, 'was deleted');
    created.facility = false;
  });

  step = 'media-delete';
  await check('Media Library: delete unused uploaded image', async () => {
    await page.goto(BASE + '/admin/media', { waitUntil: 'networkidle' });
    await page.waitForTimeout(900);
    await page.getByRole('button', { name: 'List', exact: true }).click();
    const card = page
      .locator('div')
      .filter({ hasText: uploadedName })
      .filter({ has: page.getByRole('button', { name: 'Delete', exact: true }) })
      .last();
    await card.getByRole('button', { name: 'Delete', exact: true }).click();
    await page.getByRole('button', { name: 'Delete image', exact: true }).click();
    await waitToast(page, 'Image deleted.');
    await page.waitForTimeout(600);
    assert(!(await page.content()).includes(uploadedName), 'deleted image still listed');
  });

  // ---------- event ----------
  step = 'event-create-draft';
  await check('Event: add and save as draft', async () => {
    await gotoEdit(page, '/admin/events/new');
    const sec = page.locator('section').filter({ hasText: 'Event details' });
    await sec.locator('input[type="text"]').first().fill(EVENT);
    await sec.locator('select').first().selectOption({ label: 'Awareness' });
    await sec.locator('input[type="date"]').first().fill('2026-12-15');
    created.event = true;
    await saveAndExpect(page, 'Save draft', 'Draft saved. It is not visible on the website yet.', /\/admin\/events\/[^/]+$/);
    await page.waitForTimeout(700);
  });

  step = 'event-draft-public';
  await check('Event: draft absent from public /events', async () => {
    assert(!(await publicHas('/events', EVENT)), 'draft event found on public page');
  });

  step = 'event-publish';
  await check('Event: publish and appear on public /events', async () => {
    await page.getByRole('button', { name: 'Publish', exact: true }).click();
    await waitToast(page, 'Published. It is now visible on the website.');
    await page.waitForTimeout(800);
    assert(await publicHas('/events', EVENT), 'published event missing on public page');
  });

  step = 'event-edit';
  await check('Event: edit + Save changes appears on public /events', async () => {
    const sec = page.locator('section').filter({ hasText: 'Event details' });
    await sec.locator('input[type="text"]').first().fill(EVENT2);
    await saveAndExpect(page, 'Save changes', 'Changes saved and live on the website.');
    await page.waitForTimeout(800);
    assert(await publicHas('/events', EVENT2), 'renamed event missing on public page');
  });

  step = 'event-unpublish';
  await check('Event: unpublish removes from public /events', async () => {
    await saveAndExpect(page, 'Unpublish', 'Unpublished. It has been removed from the website.');
    await page.waitForTimeout(800);
    assert(!(await publicHas('/events', EVENT2)), 'unpublished event still on public page');
  });

  step = 'event-delete';
  await check('Event: delete record', async () => {
    await deleteCurrent(page);
    created.event = false;
  });
} catch (e) {
  console.log('ERROR at step ' + step + ': ' + e.message);
  await page.screenshot({ path: '.tmp-admin/shots/fn-failure.png', fullPage: true }).catch(() => {});
} finally {
  // best-effort cleanup of anything left behind
  try {
    if (created.doctor) {
      const d = (await cleanupRecord(page, '/admin/doctors', DOCTOR2)) || (await cleanupRecord(page, '/admin/doctors', DOCTOR));
      console.log('cleanup doctor: ' + d);
    }
    if (created.facility) {
      const f = (await cleanupRecord(page, '/admin/facilities', FACILITY2)) || (await cleanupRecord(page, '/admin/facilities', FACILITY));
      console.log('cleanup facility: ' + f);
    }
    if (created.event) {
      const ev = (await cleanupRecord(page, '/admin/events', EVENT2)) || (await cleanupRecord(page, '/admin/events', EVENT));
      console.log('cleanup event: ' + ev);
    }
  } catch (e) {
    console.log('cleanup error: ' + e.message);
  }
  await browser.close();
  fs.rmSync(PHOTO_TMP, { force: true });
  console.log('\n===== RESULTS =====');
  for (const r of results) console.log((r.pass ? 'PASS' : 'FAIL') + '  ' + r.name + (r.extra ? '  [' + r.extra + ']' : ''));
  const failed = results.filter((r) => !r.pass);
  console.log('\nFailed: ' + failed.length + ' / ' + results.length);
  console.log('CONSOLE ERRORS: ' + JSON.stringify(errors, null, 2));
  process.exit(failed.length ? 1 : 0);
}
