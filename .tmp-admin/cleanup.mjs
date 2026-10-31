import { chromium } from '@playwright/test';

const b = await chromium.launch();
const c = await b.newContext();
const p = await c.newPage();
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
try {
  await p.goto('http://localhost:3100/admin/login', { waitUntil: 'networkidle' });
  log('login page');
  await p.fill('input[type=email]', 'mgrh@admin.com');
  await p.fill('input[type=password]', 'admin123');
  await p.locator('button[type=submit]').click();
  await p.waitForURL('http://localhost:3100/admin', { timeout: 30000 });
  log('signed in');
  await p.goto('http://localhost:3100/admin/doctors/doc-4j2qqqg', { waitUntil: 'networkidle' });
  log('record page', await p.locator('body').innerText().then((t) => t.slice(0, 300)));
  await p.waitForTimeout(1200);
  const del = p.getByRole('button', { name: 'Delete this record' });
  log('delete buttons', await del.count());
  await del.click();
  await p.getByRole('button', { name: 'Delete permanently' }).click();
  await p.waitForTimeout(1800);
  log('done', await p.url());
} catch (e) {
  console.log('ERR', e.message.split('\n').slice(0, 6).join(' | '));
  await p.screenshot({ path: '.tmp-admin/shots/cn-failure.png', fullPage: true }).catch(() => {});
}
await b.close();
