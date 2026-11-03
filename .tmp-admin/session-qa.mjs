import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const APP = 'http://localhost:3000';
const TS = Date.now().toString().slice(-6);
const NAME = 'QA Session ' + TS;
const SHOTS = path.resolve('.tmp-admin/shots-session');
const PROTO = pathToFileURL(path.resolve('admin-v3-source/content-admin.html')).href;
const PHOTO = path.resolve('public/admin-assets/photo-corridor.png');
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
fs.mkdirSync(SHOTS, { recursive: true });

const results = [];
const browserErrors = [];
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
async function signIn(ctx, name, role) {
  const page = await ctx.newPage();
  await page.goto(APP + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.locator('#loginF').waitFor({ timeout: 20000 });
  await page.locator('#ln').fill(name);
  await page.locator('#lr').selectOption(role);
  await page.locator('#loginF button[type=submit]').click();
  await page.waitForURL(/\/admin\/doctors/, { timeout: 30000 });
  await waitRows(page);
  return page;
}
async function publicText(text) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  try {
    await page.goto(APP + '/doctors', { waitUntil: 'networkidle' });
    return { body: await page.locator('body').innerText(), page };
  } finally {
    await ctx.close();
  }
}
async function publicImages() {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  try {
    await page.goto(APP + '/doctors', { waitUntil: 'networkidle' });
    return await page.locator('img').evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src') || ''));
  } finally {
    await ctx.close();
  }
}
async function rest(pathname, init = {}) {
  const response = await fetch(SUPABASE_URL + '/rest/v1/' + pathname, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      authorization: 'Bearer ' + SERVICE_KEY,
      'content-type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  return { status: response.status, data: text ? JSON.parse(text) : null };
}

const browser = await chromium.launch();
let created = false;
let rowId = '';
let uploadedPath = '';
let adminPage;

try {
  await check('Prototype login screenshot', async () => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await ctx.newPage();
    await page.goto(PROTO, { waitUntil: 'domcontentloaded' });
    await page.locator('#loginF').waitFor({ timeout: 20000 });
    await shot(page, 'proto-login-1440');
    await ctx.close();
  });

  await check('Login matches prototype fields and boxed input styles', async () => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => browserErrors.push('PAGEERROR ' + e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') browserErrors.push('CONSOLE ' + m.text());
    });
    await page.goto(APP + '/admin/login', { waitUntil: 'domcontentloaded' });
    await page.locator('#loginF').waitFor({ timeout: 20000 });
    const values = await page.evaluate(() => {
      const card = document.querySelector('.lcard');
      const h1 = document.querySelector('.lcard h1');
      const input = document.querySelector('#ln');
      const select = document.querySelector('#lr');
      const brand = document.querySelector('.brandrow b');
      const hint = document.querySelector('.lcard .hint');
      const css = (el) => {
        const c = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height), weight: c.fontWeight, size: c.fontSize, radius: c.borderRadius, border: c.borderTopWidth, pad: c.padding };
      };
      return {
        card: css(card),
        h1: css(h1),
        input: { ...css(input), value: input.value },
        select: { ...css(select), options: Array.from(select.options).map((o) => o.value) },
        brand: brand.textContent,
        hint: hint.textContent,
        hasEmail: Boolean(document.querySelector('input[type=email]')),
        hasPassword: Boolean(document.querySelector('input[type=password]')),
      };
    });
    assert(values.card.w === 440, 'card width ' + values.card.w);
    assert(values.card.pad === '32px', 'card padding ' + values.card.pad);
    assert(values.h1.weight === '700', 'h1 weight ' + values.h1.weight);
    assert(values.h1.size === '28px', 'h1 size ' + values.h1.size);
    assert(values.input.h >= 46 && values.input.border !== '0px' && values.input.radius === '12px', 'name input not boxed');
    assert(values.select.h >= 46 && values.select.border !== '0px' && values.select.radius === '12px', 'role select not boxed');
    assert(values.input.value === 'Hospital staff', 'name default ' + values.input.value);
    assert(JSON.stringify(values.select.options) === JSON.stringify(['Admin', 'Editor']), 'roles ' + values.select.options);
    assert(!values.hasEmail && !values.hasPassword, 'email/password still present');
    assert(values.brand === 'Morarji Gokuldas Rural Hospital', 'brand text');
    assert(values.hint.includes('recorded with every change you make'), 'hint text');
    await shot(page, 'app-login-1440');
    await ctx.close();
  });

  await check('Unauthenticated /admin/doctors redirects to login', async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(APP + '/admin/doctors', { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/admin\/login/, { timeout: 20000 });
    await page.locator('#loginF').waitFor({ timeout: 10000 });
    const stored = await page.evaluate(() => sessionStorage.getItem('mgrh-admin-user'));
    assert(stored === null, 'session key should be empty');
    await ctx.close();
  });

  await check('Sign in as Hospital staff / Admin', async () => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    adminPage = await signIn(ctx, 'Hospital staff', 'Admin');
    const stored = await adminPage.evaluate(() => sessionStorage.getItem('mgrh-admin-user'));
    assert(stored === JSON.stringify({ name: 'Hospital staff', role: 'Admin' }), 'session value ' + stored);
    const body = await adminPage.locator('body').innerText();
    assert(body.includes('Hospital staff · Admin'), 'sidebar identity missing');
    await shot(adminPage, 'app-admin-doctors-1440', true);
  });

  await check('Add doctor with photo, edit, hide/show, reorder', async () => {
    const page = adminPage;
    await page.getByRole('button', { name: 'Add doctor' }).click();
    const drawer = page.getByRole('dialog', { name: 'Add a doctor' });
    await drawer.waitFor({ timeout: 10000 });
    await drawer.locator('#f-name').fill(NAME);
    await drawer.locator('#f-role').fill('QA Session Officer');
    await drawer.locator('#f-sch').fill('QA session tagline');

    const [chooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 15000 }),
      drawer.getByRole('button', { name: 'Add photo' }).click(),
    ]);
    await chooser.setFiles(PHOTO);
    const editor = page.getByRole('dialog', { name: 'Adjust photo' });
    await editor.waitFor({ timeout: 20000 });
    await page.waitForTimeout(700);
    await editor.locator('#edalt').fill('QA session photo');
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

    const pub = await publicText();
    assert(pub.body.includes(NAME), 'doctor missing on public page');
    assert(pub.body.includes('QA Session Officer'), 'designation missing on public page');

    await row.getByRole('button', { name: 'Edit' }).click();
    const edit = page.getByRole('dialog', { name: 'Edit doctor' });
    await edit.waitFor({ timeout: 10000 });
    await edit.locator('#f-role').fill('QA Session Officer Edited');
    await edit.getByRole('button', { name: 'Save', exact: true }).click();
    await toast(page, 'Saved. The website now shows your changes.');
    await page.locator('.rows .row').filter({ hasText: 'QA Session Officer Edited' }).waitFor({ timeout: 20000 });

    const editableRow = page.locator('.rows .row').filter({ hasText: NAME });
    await editableRow.getByRole('switch').click();
    await toast(page, 'Hidden from the website.');
    const hidden = await publicText();
    assert(!hidden.body.includes(NAME), 'hidden doctor still on public page');
    await page.locator('.rows .row').filter({ hasText: NAME }).getByRole('switch').click();
    await toast(page, 'Now shown on the website.');
    const shown = await publicText();
    assert(shown.body.includes(NAME), 'shown doctor missing from public page');

    await page.locator('.rows .row').filter({ hasText: NAME }).getByRole('button', { name: 'Move up' }).click();
    await page.waitForTimeout(600);
    await page.locator('.rows .row').filter({ hasText: NAME }).getByRole('button', { name: 'Move down' }).click();
    await page.waitForTimeout(600);
  });

  await check('Photo is in Storage and the media row exists', async () => {
    const rows = await rest('media?select=id,storage_path,mime_type,uploaded_by&order=uploaded_at.desc&limit=10');
    assert(rows.status === 200, 'media query ' + rows.status);
    const media = rows.data.find((row) => row.storage_path.startsWith('cms/doctor/'));
    assert(media, 'no doctor upload in media table');
    uploadedPath = media.storage_path;
    assert(media.mime_type === 'image/jpeg', 'mime ' + media.mime_type);
    const urls = await publicImages();
    assert(urls.some((url) => url.includes(uploadedPath)), 'uploaded photo not used on public page');
  });

  await check('Delete + Undo + permanent delete', async () => {
    const page = adminPage;
    const row = page.locator('.rows .row').filter({ hasText: NAME });
    await row.getByRole('button', { name: 'Delete' }).click();
    let dialog = page.getByRole('alertdialog');
    await dialog.waitFor({ timeout: 10000 });
    await dialog.getByRole('button', { name: 'Delete' }).click();
    await toast(page, `Deleted “${NAME}”.`);
    await page.locator('.rows .row').filter({ hasText: NAME }).waitFor({ state: 'detached', timeout: 20000 });
    const gone = await publicText();
    assert(!gone.body.includes(NAME), 'deleted doctor still on public page');

    await page.locator('#toasts .toast').filter({ hasText: 'Undo' }).last().getByRole('button', { name: 'Undo' }).click();
    await toast(page, 'Restored.');
    await page.locator('.rows .row').filter({ hasText: NAME }).waitFor({ timeout: 20000 });
    const back = await publicText();
    assert(back.body.includes(NAME), 'undone doctor missing from public page');

    await page.locator('.rows .row').filter({ hasText: NAME }).getByRole('button', { name: 'Delete' }).click();
    dialog = page.getByRole('alertdialog');
    await dialog.waitFor({ timeout: 10000 });
    await dialog.getByRole('button', { name: 'Delete' }).click();
    await toast(page, `Deleted “${NAME}”.`);
    await page.locator('.rows .row').filter({ hasText: NAME }).waitFor({ state: 'detached', timeout: 20000 });
    created = false;
  });

  await check('Editor: Delete is hidden and API refuses delete', async () => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await signIn(ctx, 'Test', 'Editor');
    const stored = await page.evaluate(() => sessionStorage.getItem('mgrh-admin-user'));
    assert(stored === JSON.stringify({ name: 'Test', role: 'Editor' }), 'editor session ' + stored);
    assert((await page.locator('.rows .row').first().getByRole('button', { name: 'Delete' }).count()) === 0, 'Delete button visible for Editor');
    const id = await page.locator('.rows .row').first().getAttribute('data-id');
    const api = await page.evaluate(async (recordId) => {
      const response = await fetch('/api/admin/records?collection=doctors&id=' + recordId, {
        method: 'DELETE',
        headers: { 'x-admin-name': encodeURIComponent('Test'), 'x-admin-role': 'Editor' },
      });
      return { status: response.status, body: await response.text() };
    }, id);
    assert(api.status === 403, 'API returned ' + api.status + ' ' + api.body);
    assert(api.body.includes('Editors cannot delete'), 'wrong API error ' + api.body);
    const still = await rest('doctors?select=id&id=eq.' + id);
    assert(still.status === 200 && still.data.length === 1, 'editor delete removed the row');
    await shot(page, 'app-editor-doctors-1440', true);
    await ctx.close();
  });

  await check('activity_log records the actor name and action', async () => {
    const log = await rest('activity_log?select=*&order=id.desc&limit=40');
    assert(log.status === 200, 'activity query ' + log.status);
    const entries = log.data.filter((row) => row.entity_title === NAME || row.entity_title === NAME + ' Renamed');
    assert(entries.length > 0, 'no activity rows for ' + NAME);
    const nameRows = entries.filter((row) => row.actor_name === 'Hospital staff');
    assert(nameRows.length > 0, 'actor name missing');
    const hasRoleColumn = Object.prototype.hasOwnProperty.call(log.data[0] || {}, 'actor_role');
    if (hasRoleColumn) {
      assert(nameRows.every((row) => row.actor_role === 'Admin'), 'actor role mismatch');
      assert(nameRows.some((row) => row.entity_id), 'entity id missing');
    } else {
      console.log('NOTE  activity_log.actor_role/entity_id absent until migration 20261103_admin_session_audit.sql is run');
    }
    const editorRows = log.data.filter((row) => row.actor_name === 'Test');
    assert(editorRows.length === 0, 'editor delete should not be logged');
  });

  console.log('\nRESULTS ' + results.filter((r) => r.pass).length + '/' + results.length + ' passed');
  if (browserErrors.length) {
    console.log('BROWSER ERRORS (' + browserErrors.length + ')');
    for (const error of browserErrors.slice(0, 20)) console.log('  ' + error);
  }
} finally {
  if (created) {
    await rest('doctors?name=like.' + encodeURIComponent(NAME + '*'), { method: 'DELETE' });
  }
  if (uploadedPath) {
    const media = await rest('media?select=id&storage_path=eq.' + encodeURIComponent(uploadedPath));
    if (media.data?.length) {
      await rest('media?id=eq.' + media.data[0].id, { method: 'DELETE' });
      await fetch(SUPABASE_URL + '/storage/v1/object/media/' + uploadedPath.split('/').map(encodeURIComponent).join('/'), {
        method: 'DELETE',
        headers: { apikey: SERVICE_KEY, authorization: 'Bearer ' + SERVICE_KEY },
      });
    }
  }
  await browser.close();
}
