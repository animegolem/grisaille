/** Data-only decoder for the pinned notan-palette/1 contract. See docs/palette-contract.md. */
export type Oklch = readonly [number, number, number];
export const roleNames = ['background', 'text', 'accent', 'active', 'highlight_text',
  'frame', 'header_accent', 'inactive', 'selection'] as const;
export type RoleName = typeof roleNames[number];
export type PaletteRole = {
  hex: string;
  oklch: Oklch;
  kind: 'base' | 'derived';
  origin?: string;
  tier?: string;
  alias_of?: 'frame';
  derived_from?: 'active';
};
export type PaletteRoles = Record<Exclude<RoleName, 'selection'>, PaletteRole> & { selection?: PaletteRole };
export type VerifiedPair =
  | { kind: 'contrast'; fg: RoleName; bg: RoleName; floor: number; measured: number }
  | { kind: 'delta_l'; roles: readonly [RoleName, RoleName]; floor: number; measured: number };
export type PaletteCluster = { id: number; share: number; hex: string; oklch_extraction: Oklch };
export type PaletteTrack = {
  file: string | null;
  art_sha256: string | null;
  artist?: string;
  album?: string;
  title?: string;
};
type Envelope = {
  schema: 'notan-palette/1';
  schema_version: string;
  producer: { name: string; revision: string; spec_revision: string };
  features: string[];
  sequence: number;
  generated_at: string;
  track: PaletteTrack;
};
type Bundle = { roles: PaletteRoles; verified_pairs: VerifiedPair[] };
export type PaletteArtifact = Envelope & (
  | ({ status: 'ok'; track: PaletteTrack & { file: string; art_sha256: string }; clusters: PaletteCluster[] } & Bundle)
  | ({ status: 'no-art'; track: PaletteTrack & { file: string; art_sha256: null }; clusters: [] } &
      (Bundle | { roles?: never; verified_pairs?: never }))
  | { status: 'failed'; error: string; original_status?: string; roles?: never; verified_pairs?: never; clusters?: never }
);
export type PaletteDecodeResult =
  | { ok: true; artifact: PaletteArtifact; warnings: string[] }
  | { ok: false; error: string };

class InvalidPalette extends Error {}
function requireValue(condition: unknown, path: string, message: string): asserts condition {
  if (!condition) throw new InvalidPalette(`${path}: ${message}`);
}
function object(value: unknown, path: string): Record<string, unknown> {
  requireValue(value !== null && typeof value === 'object' && !Array.isArray(value), path, 'expected object');
  return value as Record<string, unknown>;
}
function string(value: unknown, path: string): string {
  requireValue(typeof value === 'string', path, 'expected string');
  return value;
}
function number(value: unknown, path: string): number {
  requireValue(typeof value === 'number' && Number.isFinite(value), path, 'expected finite number');
  return value;
}
function integer(value: unknown, path: string): number {
  const n = number(value, path);
  requireValue(Number.isSafeInteger(n) && n >= 0, path, 'expected nonnegative safe integer');
  return n;
}
function array(value: unknown, path: string): unknown[] {
  requireValue(Array.isArray(value), path, 'expected array');
  return value;
}
const has = (value: object, key: string) => Object.hasOwn(value, key);
function hex(value: unknown, path: string): string {
  const result = string(value, path);
  requireValue(/^#[0-9a-f]{6}$/i.test(result), path, 'expected final 6-digit sRGB hex');
  return result;
}
function oklch(value: unknown, path: string): Oklch {
  const values = array(value, path);
  requireValue(values.length === 3, path, 'expected [L, C, H]');
  const [l, c, h] = values.map((v, i) => number(v, `${path}[${i}]`));
  requireValue(l! >= 0 && l! <= 1 && c! >= 0 && h! >= 0 && h! < 360, path, 'out-of-range OKLCH');
  requireValue(c! >= 1e-4 || h === 0, path, 'achromatic hue must be exactly zero');
  return [l!, c!, h!];
}

// IEC 61966-2-1 EOTF; Ottosson's D65 linear sRGB -> OKLab matrices.
function color(hex: string): { oklch: Oklch; luminance: number } {
  const [r, g, b] = [1, 3, 5].map(i => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const lightness = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const labB = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  const chroma = Math.hypot(a, labB);
  return {
    oklch: [lightness, chroma, chroma < 1e-4 ? 0 : (Math.atan2(labB, a) * 180 / Math.PI + 360) % 360],
    luminance: 0.2126 * r + 0.7152 * g + 0.0722 * b,
  };
}

function roles(value: unknown, selection: boolean, noArt: boolean): PaletteRoles {
  const input = object(value, 'roles');
  const result: Partial<Record<RoleName, PaletteRole>> = {};
  for (const name of roleNames) {
    if (name === 'selection' && !has(input, name)) {
      requireValue(!selection, 'roles.selection', 'advertised selection role is absent');
      continue;
    }
    const path = `roles.${name}`;
    const role = object(input[name], path);
    const data: PaletteRole = {
      hex: hex(role.hex, `${path}.hex`), oklch: oklch(role.oklch, `${path}.oklch`),
      kind: role.kind as PaletteRole['kind'],
    };
    requireValue(data.kind === 'base' || data.kind === 'derived', `${path}.kind`, 'expected base or derived');
    if (name === 'inactive') {
      requireValue(role.alias_of === 'frame', path, 'inactive must alias frame');
      data.alias_of = 'frame';
    } else {
      data.origin = string(role.origin, `${path}.origin`);
      data.tier = string(role.tier, `${path}.tier`);
    }
    if (name === 'selection') {
      requireValue(data.kind === 'derived' && role.derived_from === 'active', path, 'selection must derive from active');
      data.derived_from = 'active';
    }
    const actual = color(data.hex).oklch;
    requireValue(Math.abs(data.oklch[0] - actual[0]) <= 0.002 && Math.abs(data.oklch[1] - actual[1]) <= 0.002,
      path, 'OKLCH L/C disagree with final sRGB bytes');
    // Hue has no quantity at either achromatic endpoint; never compare it there.
    if (actual[1] < 1e-4) requireValue(data.oklch[2] === 0, path, 'final achromatic color requires hue zero');
    else if (data.oklch[1] >= 1e-4) {
      const distance = Math.abs(data.oklch[2] - actual[2]);
      requireValue(Math.min(distance, 360 - distance) <= 0.5, path, 'OKLCH hue disagrees with final sRGB bytes');
    }
    result[name] = data;
  }
  requireValue(!noArt || selection === has(input, 'selection'), 'features', 'no-art selection capability must match role presence');
  requireValue(result.inactive!.hex.toLowerCase() === result.frame!.hex.toLowerCase() &&
    result.inactive!.oklch.every((v, i) => v === result.frame!.oklch[i]), 'roles.inactive', 'alias color must equal frame');
  return result as PaletteRoles;
}
function roleName(value: unknown, bundle: PaletteRoles, path: string): RoleName {
  requireValue(typeof value === 'string' && roleNames.includes(value as RoleName) && has(bundle, value), path, 'expected an emitted role');
  return value as RoleName;
}
function verifiedPairs(value: unknown, bundle: PaletteRoles, selection: boolean): VerifiedPair[] {
  const result: VerifiedPair[] = [];
  for (const [i, entry] of array(value, 'verified_pairs').entries()) {
    const path = `verified_pairs[${i}]`;
    const pair = object(entry, path);
    const kind = string(pair.kind, `${path}.kind`);
    if (kind !== 'contrast' && kind !== 'delta_l') continue;
    const floor = number(pair.floor, `${path}.floor`);
    const measured = number(pair.measured, `${path}.measured`);
    let actual: number;
    if (kind === 'contrast') {
      const fg = roleName(pair.fg, bundle, `${path}.fg`), bg = roleName(pair.bg, bundle, `${path}.bg`);
      const a = color(bundle[fg]!.hex).luminance, b = color(bundle[bg]!.hex).luminance;
      actual = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      requireValue(floor >= 1 && floor <= 21, `${path}.floor`, 'contrast floor outside [1, 21]');
      result.push({ kind, fg, bg, floor, measured });
    } else {
      const names = array(pair.roles, `${path}.roles`);
      requireValue(names.length === 2, `${path}.roles`, 'expected two roles');
      const a = roleName(names[0], bundle, `${path}.roles[0]`), b = roleName(names[1], bundle, `${path}.roles[1]`);
      actual = color(bundle[a]!.hex).oklch[0] - color(bundle[b]!.hex).oklch[0];
      requireValue(floor >= -1 && floor <= 1, `${path}.floor`, 'delta L floor outside [-1, 1]');
      result.push({ kind, roles: [a, b], floor, measured });
    }
    const precision = kind === 'contrast' ? 1e3 : 1e6;
    requireValue(Math.abs(measured - Math.round(actual * precision) / precision) < 1e-9,
      `${path}.measured`, 'measurement disagrees with rounded final-byte result');
    requireValue(actual >= floor, path, 'final bytes fail declared floor');
  }
  if (selection) {
    for (const [fg, bg] of [['text', 'background'], ['accent', 'background'], ['active', 'background'],
      ['highlight_text', 'active'], ['highlight_text', 'selection'], ['frame', 'background']]) {
      requireValue(result.some(p => p.kind === 'contrast' && p.fg === fg && p.bg === bg),
        'verified_pairs', `missing required contrast ${fg}/${bg}`);
    }
    requireValue(result.some(p => p.kind === 'delta_l' && p.roles[0] === 'selection' && p.roles[1] === 'active'),
      'verified_pairs', 'missing required selection/active delta_l');
  }
  return result;
}
function clusters(value: unknown): PaletteCluster[] {
  const result = array(value, 'clusters').map((entry, i) => {
    const path = `clusters[${i}]`, input = object(entry, path);
    const share = number(input.share, `${path}.share`);
    requireValue(share > 0 && share <= 1, `${path}.share`, 'expected share in (0, 1]');
    return { id: integer(input.id, `${path}.id`), share, hex: hex(input.hex, `${path}.hex`),
      oklch_extraction: oklch(input.oklch_extraction, `${path}.oklch_extraction`) };
  });
  requireValue(new Set(result.map(c => c.id)).size === result.length, 'clusters', 'duplicate id');
  const sum = result.reduce((total, c) => total + c.share, 0);
  // JSON decimal shares accumulate binary roundoff at the inclusive limit.
  requireValue(sum <= 1.001 + Number.EPSILON * result.length, 'clusters', 'shares exceed 1.001');
  for (let i = 1; i < result.length; i++) {
    const previous = result[i - 1]!, current = result[i]!;
    requireValue(previous.share > current.share || (previous.share === current.share && previous.id < current.id),
      'clusters', 'expected share descending, id ascending for ties');
  }
  return result;
}

/** No I/O or retention. Unknown statuses emit one warning through the supplied logger. */
export function decodePaletteArtifact(json: string, log: (warning: string) => void = console.warn): PaletteDecodeResult {
  const warnings: string[] = [];
  let artifact: PaletteArtifact;
  try {
    let parsed: unknown;
    try { parsed = JSON.parse(json); } catch { throw new InvalidPalette('artifact: invalid JSON'); }
    const input = object(parsed, 'artifact');
    requireValue(input.schema === 'notan-palette/1', 'schema', 'unsupported palette schema');
    const schema_version = string(input.schema_version, 'schema_version');
    requireValue(/^1\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(schema_version),
      'schema_version', 'expected supported v1 semantic version');
    const producer = object(input.producer, 'producer');
    const features = array(input.features, 'features').map((v, i) => string(v, `features[${i}]`));
    const status = string(input.status, 'status');
    const unknownStatus = !['ok', 'no-art', 'failed'].includes(status);
    const failed = status === 'failed' || unknownStatus;
    const trackInput = object(input.track, 'track');
    const file = trackInput.file === null && failed ? null : string(trackInput.file, 'track.file');
    const hash = trackInput.art_sha256;
    requireValue(hash === null || (typeof hash === 'string' && /^[a-f0-9]{64}$/i.test(hash)), 'track.art_sha256', 'expected null or full SHA256 hex');
    const track: PaletteTrack = { file, art_sha256: hash };
    for (const key of ['artist', 'album', 'title'] as const) {
      if (has(trackInput, key)) track[key] = string(trackInput[key], `track.${key}`);
    }
    const generated_at = string(input.generated_at, 'generated_at');
    requireValue(Number.isFinite(Date.parse(generated_at)), 'generated_at', 'expected timestamp');
    const envelope: Envelope = {
      schema: 'notan-palette/1', schema_version,
      producer: { name: string(producer.name, 'producer.name'), revision: string(producer.revision, 'producer.revision'),
        spec_revision: string(producer.spec_revision, 'producer.spec_revision') },
      features, sequence: integer(input.sequence, 'sequence'), generated_at, track,
    };
    if (failed) {
      if (unknownStatus) {
        const warning = `Unknown palette status ${JSON.stringify(status)}; treating as failed`;
        warnings.push(warning);
        // Never expose a future status's payload as usable roles or clusters.
        artifact = { ...envelope, status: 'failed', original_status: status,
          error: typeof input.error === 'string' ? input.error : warning };
      } else {
        for (const key of ['roles', 'verified_pairs', 'clusters']) {
          requireValue(!has(input, key), key, 'must be absent for failed status');
        }
        artifact = { ...envelope, status: 'failed', error: string(input.error, 'error') };
      }
    } else {
      const selection = features.includes('selection');
      const noArt = status === 'no-art';
      const decodedClusters = clusters(input.clusters);
      if (noArt) {
        requireValue(hash === null && decodedClusters.length === 0, 'track/clusters', 'no-art requires null hash and empty clusters');
        requireValue(has(input, 'roles') === has(input, 'verified_pairs'), 'roles/verified_pairs', 'no-art bundle must be both present or both absent');
      } else requireValue(typeof hash === 'string', 'track.art_sha256', 'ok requires artwork identity');
      if (noArt && !has(input, 'roles')) {
        requireValue(!selection, 'features', 'absent no-art bundle cannot advertise selection');
        artifact = { ...envelope, status: 'no-art', track: { ...track, file: file!, art_sha256: null }, clusters: [] };
      } else {
        const decodedRoles = roles(input.roles, selection, noArt);
        const bundle = { roles: decodedRoles, verified_pairs: verifiedPairs(input.verified_pairs, decodedRoles, selection) };
        artifact = noArt
          ? { ...envelope, ...bundle, status: 'no-art', track: { ...track, file: file!, art_sha256: null }, clusters: [] }
          : { ...envelope, ...bundle, status: 'ok', track: { ...track, file: file!, art_sha256: hash as string }, clusters: decodedClusters };
      }
    }
  } catch (error) {
    if (error instanceof InvalidPalette) return { ok: false, error: error.message };
    throw error;
  }
  // Logging is outside validation so a throwing caller logger is not mislabeled bad data.
  for (const warning of warnings) log(warning);
  return { ok: true, artifact, warnings };
}
