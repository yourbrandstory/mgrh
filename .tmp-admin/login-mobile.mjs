import { chromium } from 'playwright';
import path from 'path';
import { pathToFileURL } from 'url';
const b = await chromium.launch();
for (const [label, url] of [['app','http://localhost:3000/admin/login'],['proto',pathToFileURL(path.resolve('admin-v3-source/content-admin.html')).href]]) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto(url);
  await p.locator('#loginF').waitFor();
  await p.waitForTimeout(400);
  console.log(label, await p.locator('#loginF').boundingBox());
  await p.screenshot({ path: '.tmp-admin/shots-session/' + label + '-login-390.png' });
  await p.close();
}
await b.close();
