#!/usr/bin/env node
/* 일회용 — 엔진의 하드코딩 데이터 배열을 위젯 HTML로 외부화(config 주입)
 * 사용: node tools/_inject-cfg.mjs <engineName> <varName> <cfgKey> <embedId>
 * 예:   node tools/_inject-cfg.mjs write-output EXAMPLES examples CH01-L04-S01
 * 동작: _engine/<engineName>.js 의 `var <varName> = [ ... ];` 를 추출 →
 *       embeds/abap/<embedId>.html 에 `<script>window.__SDA_CFG__=…{<cfgKey>:[...]}</script>` 주입(엔진 src 앞),
 *       엔진의 그 줄은 `var <varName> = (window.__SDA_CFG__||{}).<cfgKey> || [];` 로 교체.
 * → 엔진=순수 로직(재사용), 데이터=레슨 위젯에 동거. (배열 안에 ']' 없는 단순 데이터 전용.)
 */
import fs from 'node:fs';
import path from 'node:path';
const [, , engine, varName, cfgKey, embedId] = process.argv;
if (!engine || !varName || !cfgKey || !embedId) { console.error('args: <engine> <varName> <cfgKey> <embedId>'); process.exit(1); }
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const engFile = path.join(ROOT, 'embeds', '_engine', engine + '.js');
const htmlFile = path.join(ROOT, 'embeds', 'abap', embedId + '.html');

let js = fs.readFileSync(engFile, 'utf8');
const re = new RegExp('var\\s+' + varName + '\\s*=\\s*(\\[[\\s\\S]*?\\])\\s*;');
const m = re.exec(js);
if (!m) { console.error('데이터 배열을 못 찾음: ' + varName); process.exit(2); }
const arrayText = m[1];
js = js.replace(re, 'var ' + varName + ' = (window.__SDA_CFG__||{}).' + cfgKey + ' || [];');
fs.writeFileSync(engFile, js, 'utf8');

let html = fs.readFileSync(htmlFile, 'utf8');
const cfgTag = '<script>window.__SDA_CFG__=Object.assign(window.__SDA_CFG__||{},{' + cfgKey + ':' + arrayText + '});</script>\n';
const anchor = '<script src="../_engine/' + engine + '.js"';
if (html.indexOf('window.__SDA_CFG__') === -1) {
  html = html.replace(anchor, cfgTag + anchor);
  fs.writeFileSync(htmlFile, html, 'utf8');
}
console.log('✓ ' + engine + '.js: ' + varName + ' → cfg.' + cfgKey + ' (' + arrayText.length + 'b) · ' + embedId + '.html에 주입');
