import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { decodePaletteArtifact } from '../src/palette-contract';

const fixture = (name: string) => readFileSync(new URL(`./fixtures/palette/${name}.json`, import.meta.url), 'utf8');
const input = (name = 'ok') => JSON.parse(fixture(name));
const decode = (value: unknown) => decodePaletteArtifact(JSON.stringify(value));
function rejected(value: unknown, path: string) {
  const result = decode(value);
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.error).toContain(path);
}

describe('pinned producer conformance fixtures', () => {
  for (const name of ['ok', 'no-art', 'no-art-verified', 'failed', 'failed-no-identity', 'achromatic-wrap']) {
    test(`accept ${name}`, () => {
      const result = decodePaletteArtifact(fixture(name));
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.artifact.status).toBe(input(name).status);
        expect(result.warnings).toEqual([]);
      }
    });
  }
  for (const name of ['invalid-schema-major', 'invalid-no-art-partial-bundle', 'invalid-no-art-null-roles']) {
    test(`reject ${name}`, () => expect(decodePaletteArtifact(fixture(name)).ok).toBe(false));
  }
  test('preserve achromatic hue, wrap endpoints, extraction coordinates and unnormalized shares', () => {
    const result = decodePaletteArtifact(fixture('achromatic-wrap'));
    expect(result.ok).toBe(true);
    if (!result.ok || result.artifact.status !== 'ok') throw new Error('Missing fixture');
    const clusters = result.artifact.clusters;
    expect(clusters).toEqual(input('achromatic-wrap').clusters);
    expect(clusters.reduce((sum, c) => sum + c.share, 0)).toBeCloseTo(0.963, 12);
    expect(clusters.map(c => c.oklch_extraction[2])).toEqual([352, 8, 0, 210, 95]);
  });
});

describe('identity and forward compatibility', () => {
  test('unknown top-level fields cannot become capabilities or leak into the result', () => {
    const value = input();
    value.capabilities = ['future-feature']; value.script = 'throw new Error("executed")';
    Object.defineProperty(value, '__proto__', { value: { injected: true }, enumerable: true });
    const result = decode(value);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.artifact.features).toEqual(['selection']);
      expect(result.artifact).not.toHaveProperty('script');
      expect(result.artifact).not.toHaveProperty('injected');
      expect(result.artifact).not.toHaveProperty('fixture_note');
    }
  });
  test('unknown status becomes failed, keeps request identity, drops payload and logs once', () => {
    const value = input(); value.status = 'pending-analysis';
    const warnings: string[] = [];
    const result = decodePaletteArtifact(JSON.stringify(value), message => warnings.push(message));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.artifact.status).toBe('failed');
      expect(result.artifact.track.file).toBe(value.track.file);
      expect(result.artifact).toHaveProperty('original_status', 'pending-analysis');
      expect(result.artifact).not.toHaveProperty('roles');
      expect(result.artifact).not.toHaveProperty('clusters');
      expect(result.artifact).not.toHaveProperty('verified_pairs');
      expect(warnings).toEqual(result.warnings);
      expect(warnings).toHaveLength(1);
    }
  });
  test('unknown pair kind ignores only its entry, without interpreting future fields', () => {
    const value = input();
    value.verified_pairs.splice(2, 0, { kind: 'future', floor: null, roles: 'unrecognized' });
    const result = decode(value);
    expect(result.ok).toBe(true);
    if (result.ok && result.artifact.status === 'ok') expect(result.artifact.verified_pairs).toEqual(input().verified_pairs);
  });
  test('unknown feature and future v1 version survive; producer version does not infer features', () => {
    const value = input();
    value.schema_version = '1.20.3'; value.producer.spec_revision = '9000'; value.features = ['future'];
    const result = decode(value);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.artifact.features).toEqual(['future']);
  });
  test('failed identity is independent from earlier success and decoder owns no retention', () => {
    const success = decodePaletteArtifact(fixture('ok'));
    const failure = decodePaletteArtifact(fixture('failed-no-identity'));
    expect(success.ok && success.artifact.status).toBe('ok');
    expect(failure.ok && failure.artifact.status).toBe('failed');
    if (failure.ok) { expect(failure.artifact.track.file).toBeNull(); expect(failure.artifact).not.toHaveProperty('roles'); }
    expect(success.ok && success.artifact.track.file).toBe(input().track.file);
    expect(decodePaletteArtifact(fixture('invalid-schema-major')).ok).toBe(false);
    expect(success.ok && success.artifact.status).toBe('ok');
  });
  for (const field of ['roles', 'verified_pairs', 'clusters']) {
    test(`failed rejects present ${field}, including null`, () => {
      const value = input('failed'); value[field] = null; rejected(value, field);
    });
  }
  test('sequence is debug-only: lower values after restart decode without state', () => {
    const value = input(); value.sequence = 0;
    expect(decodePaletteArtifact(fixture('ok')).ok).toBe(true);
    expect(decode(value).ok).toBe(true);
  });
});

describe('no-art and selection boundaries', () => {
  test('absent no-art stays distinct from failure and portable verified no-art', () => {
    const absent = decodePaletteArtifact(fixture('no-art'));
    const verified = decodePaletteArtifact(fixture('no-art-verified'));
    expect(absent.ok && absent.artifact.status).toBe('no-art');
    if (absent.ok) { expect(absent.artifact).not.toHaveProperty('roles'); expect(absent.artifact.clusters).toEqual([]); }
    expect(verified.ok && verified.artifact.status).toBe('no-art');
    if (verified.ok) expect(verified.artifact.roles?.selection?.kind).toBe('derived');
  });
  test('cannot advertise selection without emitted selection, even for absent no-art', () => {
    const absent = input('no-art'); absent.features = ['selection']; rejected(absent, 'features');
    const value = input(); delete value.roles.selection; rejected(value, 'roles.selection');
  });
  test('no-art requires feature iff selection exists', () => {
    const value = input('no-art-verified'); value.features = []; rejected(value, 'features');
  });
  test('selection-free bundle stays selection-free without synthesis from inactive', () => {
    const value = input('no-art-verified');
    value.features = []; delete value.roles.selection;
    value.verified_pairs = value.verified_pairs.filter((p: any) => p.bg !== 'selection' && p.kind !== 'delta_l');
    const result = decode(value);
    expect(result.ok).toBe(true);
    if (result.ok) { expect(result.artifact.roles).not.toHaveProperty('selection'); expect(result.artifact.roles?.inactive.alias_of).toBe('frame'); }
  });
  test('both-present requires complete non-null bundle', () => {
    const value = input('no-art-verified'); delete value.roles.text; rejected(value, 'roles.text');
    const nullPairs = input('no-art-verified'); nullPairs.verified_pairs = null; rejected(nullPairs, 'verified_pairs');
  });
  test('no-art rejects missing clusters, nonempty clusters and artwork hash', () => {
    const missing = input('no-art'); delete missing.clusters; rejected(missing, 'clusters');
    const populated = input('no-art'); populated.clusters = input().clusters; rejected(populated, 'track/clusters');
    const hash = input('no-art'); hash.track.art_sha256 = input().track.art_sha256; rejected(hash, 'track/clusters');
  });
});

describe('untrusted data and numeric claims', () => {
  for (const text of ['{', 'null', '[]', '42', '"palette"']) {
    test(`reject non-artifact JSON ${text}`, () => expect(decodePaletteArtifact(text).ok).toBe(false));
  }
  test('reject malformed envelope and identity', () => {
    const mutations: [string, (v: any) => void][] = [
      ['schema_version', v => v.schema_version = '2.0.0'], ['features', v => v.features = [1]],
      ['producer', v => v.producer.revision = null], ['sequence', v => v.sequence = -1],
      ['sequence', v => v.sequence = Number.MAX_SAFE_INTEGER + 1], ['sequence', v => v.sequence = 1.5],
      ['generated_at', v => v.generated_at = 'yesterday'], ['track.file', v => v.track.file = null],
      ['track.art_sha256', v => v.track.art_sha256 = 'abcd'], ['track.art_sha256', v => v.track.art_sha256 = null],
    ];
    for (const [path, mutate] of mutations) { const value = input(); mutate(value); rejected(value, path); }
    const infinite = fixture('ok').replace('"sequence": 41', '"sequence": 1e400');
    expect(decodePaletteArtifact(infinite).ok).toBe(false);
  });
  test('reject wrong role hex, coordinates, aliases and derivation', () => {
    const mutations: [string, (v: any) => void][] = [
      ['roles.text', v => v.roles.text.hex = 'reset'], ['roles.text', v => v.roles.text.oklch[0] += 0.01],
      ['roles.text', v => v.roles.text.oklch[2] += 1], ['roles.text', v => v.roles.text.oklch = [1, 0]],
      ['roles.inactive', v => v.roles.inactive.alias_of = 'active'], ['roles.selection', v => v.roles.selection.kind = 'base'],
      ['roles.selection', v => v.roles.selection.derived_from = 'frame'],
    ];
    for (const [path, mutate] of mutations) { const value = input(); mutate(value); rejected(value, path); }
  });
  test('reject fabricated measurements, missing guarantees and unmet declared floors', () => {
    const falseMeasurement = input(); falseMeasurement.verified_pairs[0].measured = 20; rejected(falseMeasurement, 'measured');
    const floor = input('no-art-verified'); floor.verified_pairs[0].floor = 21; rejected(floor, 'floor');
    const delta = input(); delta.verified_pairs.at(-1).roles.reverse(); rejected(delta, 'measured');
    const missing = input(); missing.verified_pairs.pop(); rejected(missing, 'missing required');
    const unknown = input(); unknown.verified_pairs[0].kind = 'future'; rejected(unknown, 'missing required');
  });
  test('a byte-resolvable all-black bundle cannot claim verified no-art', () => {
    const value = input('no-art-verified');
    for (const role of Object.values(value.roles) as any[]) { role.hex = '#000000'; role.oklch = [0, 0, 0]; }
    for (const pair of value.verified_pairs) pair.measured = pair.kind === 'contrast' ? 1 : 0;
    rejected(value, 'floor');
  });
  test('decimal share sums include the exact 1.001 boundary without widening it materially', () => {
    const value = input();
    value.clusters = value.clusters.slice(0, 3);
    [0.7, 0.201, 0.1].forEach((share, i) => value.clusters[i].share = share);
    expect(decode(value).ok).toBe(true);
    value.clusters[1].share = 0.2010000001;
    rejected(value, 'clusters');
  });
  test('cluster invariants: finite numbers, ranges, ordering, uniqueness, sum, achromatic hue', () => {
    const mutations = [
      (v: any) => v.clusters[0].share = 0, (v: any) => v.clusters[0].share = 1.1,
      (v: any) => v.clusters[1].id = v.clusters[0].id, (v: any) => v.clusters.reverse(),
      (v: any) => v.clusters[0].share += 0.002,
      (v: any) => v.clusters[0].oklch_extraction = [0.5, 0, 30],
      (v: any) => v.clusters[0].oklch_extraction[2] = 360,
      (v: any) => v.clusters[0].oklch_extraction[0] = -0.1,
    ];
    for (const mutate of mutations) { const value = input(); mutate(value); rejected(value, 'clusters'); }
    const ties = input(); ties.clusters = [{ ...ties.clusters[0], share: 0.4, id: 2 }, { ...ties.clusters[1], share: 0.4, id: 1 }];
    rejected(ties, 'clusters'); ties.clusters.reverse(); expect(decode(ties).ok).toBe(true);
  });
});
