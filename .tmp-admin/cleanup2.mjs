import { chromium } from '@playwright/test';

const b = await chromium.launch();
const c = await b.newContext();
const p = await c.newPage();
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
try {
  await p.goto('http://localhost:3100/admin/login', { waitUntil: 'networkidle' });
  await p.fill('input[type=email]', 'mgrh@admin.com');
  await p.fill('input[type=password]', 'admin123');
  await p.locator('button[type=submit]').click();
  await p.waitForURL('http://localhost:3100/admin', { timeout: 30000 });
  log('signed in');
  await p.goto('http://localhost:3100/admin/doctors', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  log('rows with QA Doctor:', await p.getByText(/QA Doctor/).count());
  const row = p.getByText(/^QA Doctor /).locator('xpath=ancestor::div[.//button[normalize-space()="Delete"]][1]');
  log('row count', await row.count());
  log('row text', (await row.first().innerText()).slice(0, 120).replace(/\n/g, ' | '));
  await row.first().getByRole('button', { name: 'Delete', exact: true }).click();
  await p.getByRole('button', { name: 'Delete permanently' }).click();
  await p.waitForTimeout(2000);
  log('after delete rows:', await p.getByText(/QA Doctor/).count());
} catch (e) {
  console.log('ERR', e.message.split('\n').slice(0, 5).join(' | '));
  await p.screenshot({ path: '.tmp-admin/shots/cn2-failure.png', fullPage: true }).catch(() => {});
}
await b.close();
