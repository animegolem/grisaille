import { readFileSync } from 'node:fs';
import { decodePaletteArtifact } from '/Users/golem/git/grisaille/src/palette-contract.ts';
const base = '/Users/golem/git/grisaille/tests/fixtures/palette/';
for (const [name, file, mutate] of [
  ['baseline', 'ok', (_: any) => {}],
  ['selection tier omitted', 'ok', (v: any) => { delete v.roles.selection.tier; }],
  ['stock-base no-art without solver tiers', 'no-art-verified', (v: any) => {
    for (const [name, r] of Object.entries(v.roles) as [string, any][]) if(name !== 'inactive') {r.origin = 'stock-base'; delete r.tier;}
  }],
  ['non-selection origin omitted', 'ok', (v: any) => { delete v.roles.background.origin; }],
  ['alias hex case only', 'ok', (v: any) => {v.roles.inactive.hex = v.roles.inactive.hex.toUpperCase();}],
  ['ok role remains, selection feature absent', 'ok', (v: any) => {v.features = [];}],
] as const) {
  const v = JSON.parse(readFileSync(base + file + '.json', 'utf8'));
  mutate(v); const r = decodePaletteArtifact(JSON.stringify(v));
  console.log(JSON.stringify({name, accepted:r.ok, error:r.ok ? undefined : r.error}));
}
