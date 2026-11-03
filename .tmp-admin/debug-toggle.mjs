import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
const p = await ctx.newPage();
p.on('console', m => console.log('CONSOLE', m.type(), m.text()));
p.on('pageerror', e => console.log('PAGEERROR', e.message));
p.on('response', r => { if (r.url().includes('/api/admin')) console.log('API', r.status(), r.url()); });
await p.goto('http://localhost:3000/admin/login');
await p.locator('#loginF').waitFor();
await p.locator('#ln').fill('Hospital staff');
await p.locator('#lr').selectOption('Admin');
await p.locator('#loginF button[type=submit]').click();
await p.waitForURL(/\/admin\/doctors/);
await p.locator('.rows .row').first().waitFor();
const qa = p.locator('.rows .row').filter({ hasText: 'QA Session' });
console.log('rows with QA:', await qa.count());
if (await qa.count()) {
  console.log((await qa.first().innerText()).replace(/\n/g,' | '));
  console.log('id', await qa.first().getAttribute('data-id'));
  console.log('switches', await qa.first().getByRole('switch').count());
  const sw = qa.first().getByRole('switch');
  if (await sw.count()) {
    console.log('aria-checked before', await sw.getAttribute('aria-checked'));
    await sw.click();
    await p.waitForTimeout(1500);
    console.log('after click rows with QA:', await p.locator('.rows .row').filter({ hasText: 'QA Session' }).count());
    console.log('body has name?', (await p.locator('body').innerText()).includes('QA Session'));
    await p.screenshot({ path: '.tmp-admin/shots-session/debug-after-toggle.png', fullPage: true });
  }
}
await b.close();
