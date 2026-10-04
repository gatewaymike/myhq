// Copy lint: banned terms, retired figures, mainland vocabulary and em dashes.
// A line containing "lint-allow" is skipped (for comments that state the rule itself).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOTS = ['src', 'index.html', 'supabase']; // design/ holds internal approval pages, not app copy
const EXT = new Set(['.ts', '.tsx', '.html', '.json', '.sql', '.css']);
const RULES = [
  [/—/, 'em dash'],
  [/risk[- ]free|completely inert|zero (interactions|toxicity|contraindications)|no adverse effects/i, 'banned absolute-safety language'],
  [/\bproven\b/i, '"proven"'],
  [/\bbolus\b/i, '"bolus" (use rapid-spike)'],
  [/standard of care/i, '"standard of care"'],
  [/\bneutral\b/i, '"neutral"'],
  [/synergy/i, '"synergy" (removed, R-364)'],
  [/certif|accredit|\bgraded\b|HQ Rated/i, 'Registry terminology'],
  [/\bgoals?\b/i, '"goal" (10.0 is a reference value, R-365)'],
  [/13\.75|\b27%|1,?000 papers|1000篇/, 'retired figure'],
  [/劑量/, '劑量 (dose): use 攝取量 (intake)'],
  [/療程/, '療程 (course of treatment)'],
  [/設置|保存|數據|當前|實時/, 'mainland vocabulary'],
  [/purity/i, 'purity input (G1, R-091)'],
  [/inhaler/i, '"inhaler" (reads as an asthma inhaler; use "device")'],
];

function* walk(p) {
  const s = statSync(p);
  if (s.isDirectory()) for (const f of readdirSync(p)) yield* walk(join(p, f));
  else if (EXT.has(extname(p))) yield p;
}

let bad = 0;
for (const root of ROOTS) {
  for (const file of walk(root)) {
    readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
      if (line.includes('lint-allow')) return;
      for (const [re, why] of RULES) if (re.test(line)) { bad++; console.log(`${file}:${i + 1}  ${why}\n    ${line.trim().slice(0, 140)}`); }
    });
  }
}
if (bad) { console.log(`\n${bad} copy problem(s).`); process.exit(1); }
console.log('Copy lint clean.');
