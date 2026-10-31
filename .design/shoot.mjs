import puppeteer from 'puppeteer-core';
import path from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const [mode, target, out, widthArg] = process.argv.slice(2);
const width = Number(widthArg || 1440);

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width, height: 1000, deviceScaleFactor: 1 });

if (mode === 'file') {
  const fileUrl = 'file:///' + path.resolve(target).replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));
} else {
  await page.goto(target, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2500));
}

const h = await page.evaluate(() => document.documentElement.scrollHeight);
await page.screenshot({ path: out, fullPage: true });
console.log(JSON.stringify({ out, width, height: h }));
await browser.close();
