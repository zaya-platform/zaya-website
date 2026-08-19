#!/usr/bin/env node
/* Reproduces the arithmetic quoted in tokens.css beside the SPACING LADDER.
 * Run from the repo root:  node docs/reviews/component-pass-2026-08-20/spacing-audit.mjs
 * It reads the LIVE stylesheet, so if the numbers in that comment ever stop
 * matching this output, the comment is the thing that is wrong. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const file = path.join(root, 'src/styles/site.css');
const css = fs.readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, ' ');

const props = /(?:^|[;{])\s*((?:margin|padding|gap|row-gap|column-gap|margin-inline|padding-inline)(?:-top|-right|-bottom|-left)?)\s*:\s*([^;}]+)/g;
const nums = [];
let m;
while ((m = props.exec(css))) {
  const v = m[2];
  if (/var\(|clamp\(|calc\(|%/.test(v)) continue;   // tokenised or fluid: not a literal
  for (const t of v.trim().split(/\s+/)) {
    const n = /^([\d.]+)px$/.exec(t);
    if (n && +n[1] > 0) nums.push(+n[1]);
  }
}

console.log(`site.css literal px spacing declarations: ${nums.length}`);
console.log(`distinct values: ${new Set(nums).size}`);
console.log('');
console.log('base   on-base        would move   max move   total movement');
for (const b of [2, 3, 4, 5, 6, 8]) {
  let moved = 0, max = 0, sum = 0;
  for (const n of nums) {
    const snapped = Math.max(b, Math.round(n / b) * b);
    const d = Math.abs(snapped - n);
    if (d > 0) moved++;
    max = Math.max(max, d);
    sum += d;
  }
  const pct = (100 * (nums.length - moved) / nums.length).toFixed(1) + '%';
  console.log(
    `${String(b + 'px').padEnd(6)} ${pct.padEnd(14)} ${String(moved).padEnd(12)} ${String(max + 'px').padEnd(10)} ${sum}px`
  );
}
console.log('');
console.log('The ladder in tokens.css is on the 4px base. The legacy declarations');
console.log('above are deliberately NOT migrated — see the comment in tokens.css.');
