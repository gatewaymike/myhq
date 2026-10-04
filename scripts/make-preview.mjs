// Turns the single-file preview build into an Artifact page body (the host adds doctype/html/head/body).
import { readFileSync, writeFileSync } from 'node:fs';
let html = readFileSync('dist-preview/index.html', 'utf8');
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1];
const body = html.match(/<body>([\s\S]*?)<\/body>/)[1];
let out = head
  .replace(/<meta charset[^>]*>/i, '')
  .replace(/<meta name="viewport"[^>]*>/i, '')
  .replace(/<link rel="canonical"[^>]*>/i, '')
  .replace(/<meta (property|name)="(og|twitter):[^>]*>/gi, '')
  .replace(/<title>[^<]*<\/title>/, '<title>MyHQ Rebuild Preview</title>');
out = out.trim() + '\n' + body.trim() + '\n';
writeFileSync('dist-preview/myhq-preview.html', out);
console.log('bytes', out.length, 'em dashes', (out.match(/—/g) || []).length);
