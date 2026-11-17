#!/usr/bin/env node
// Confere que todo membro declarado no .mmd aparece como texto no SVG da classe.
// status 0 do mmdc não basta: uma classe pode renderizar vazia.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('.', import.meta.url).pathname.replace(/\/$/, '');
const src = join(root, 'src');
const out = join(root, 'out');

const decode = (text) => text
  .replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#45;/g, '-').replace(/&nbsp;/g, ' ');

function classesOf(mmd) {
  const classes = new Map();
  const lines = mmd.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const open = lines[i].match(/^([ \t]*)class[ \t]+([A-Za-z_][A-Za-z0-9_]*)[ \t]*(\{)?[ \t]*$/);
    if (!open) continue;
    const name = open[2];
    if (!open[3]) {
      classes.set(name, { body: '', members: [] });
      continue;
    }
    const body = [];
    i++;
    while (i < lines.length && lines[i].trim() !== '}') {
      body.push(lines[i]);
      i++;
    }
    const members = body.map((line) => line.trim()).filter((line) => line.length > 1 && ['+', '#', '-'].includes(line[0]));
    classes.set(name, { body: body.join('\n').trim(), members });
  }
  return classes;
}

function memberName(line) {
  const bare = line.slice(1).trim();
  if (bare.includes('(')) {
    return bare.slice(0, bare.indexOf('(')).trim().split(' ').filter(Boolean).pop();
  }
  return bare.split(' ').filter(Boolean).pop();
}

const escapeRe = (text) => text.replace(/[^\w]/g, (ch) => '\\' + ch);

let failures = 0;
for (const file of readdirSync(src).filter((name) => /^b.*\.mmd$/.test(name)).sort()) {
  const classes = classesOf(readFileSync(join(src, file), 'utf8'));
  const svg = readFileSync(join(out, file.replace(/\.mmd$/, '.svg')), 'utf8');
  const starts = [...svg.matchAll(/<g class="node[^"]*" id="[^"]*classId-([A-Za-z_][A-Za-z0-9_]*?)-\d+"/g)];

  for (const [name, info] of classes) {
    if (info.members.length === 0) {
      // Um stereotype sozinho não é conteúdo; qualquer outra classe tem de listar membros.
      if (!/<<(enum|interface|abstract)>>/.test(info.body)) {
        console.error(`VAZIA NO .MMD: ${file} :: ${name}`);
        failures++;
      }
      continue;
    }

    const index = starts.findIndex((entry) => entry[1] === name);
    if (index < 0) {
      console.error(`CLASSE AUSENTE NO SVG: ${file} :: ${name}`);
      failures++;
      continue;
    }
    const chunk = svg.slice(starts[index].index, starts[index + 1]?.index ?? svg.length);
    const text = decode(chunk);

    for (const member of info.members) {
      const token = memberName(member);
      const found = new RegExp(`(^|[^A-Za-z0-9_])${escapeRe(token)}([^A-Za-z0-9_]|$)`).test(text);
      if (!found) {
        console.error(`MEMBRO AUSENTE NO SVG: ${file} :: ${name} :: ${member}`);
        failures++;
      }
    }
  }
  console.log(`${file}: ${classes.size} classes conferidas`);
}

console.log(`Falhas: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
