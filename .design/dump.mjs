import puppeteer from 'puppeteer-core';
import path from 'node:path';
import fs from 'node:fs';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const [mode, target, out] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
const p = await b.newPage();
const url = mode === 'file' ? 'file:///' + path.resolve(target).split('\\').join('/') : target;
await p.goto(url, { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 1800));
const html = await p.content();
fs.writeFileSync(out, html);
console.log('wrote', out, html.length);
await b.close();
