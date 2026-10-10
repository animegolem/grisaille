import { connectStdio } from '@gpuix/react/automation';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline';

// Build/package first. This launches the actual compiled native app with demo
// playback and a private source/state/journal. It does not simulate an IME.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const argument = process.argv[2];
const interactive = process.argv.includes('--interactive');
if (argument && !isAbsolute(argument)) throw new Error('Evidence output must be an absolute NEW directory.');
const output = argument ?? mkdtempSync(join(tmpdir(), 'grisaille-theme-native-'));
if (argument) mkdirSync(output, { mode: 0o700 });
const probe = join(output, 'probe');
mkdirSync(probe, { mode: 0o700 });
const binary = join(root, 'dist/Music Prototype.app/Contents/MacOS/music-ui'), fixturePath = join(root, 'tests/fixtures/palette/host-ramp.json');
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));
const hash = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex');
const report: Record<string, any> = { binary, binary_sha256: hash(binary), fixture: fixturePath, fixture_sha256: hash(fixturePath),
  fixture_note: fixture.fixture_note, output, cases: [],
  boundary: 'Actual GPUIX native app/Metal screenshot path. Screenshot pixel encoding/profile is recorded; physical display calibration and real IME composition require separate evidence.' };
function publish(artifact: unknown) {
  const temporary = join(probe, 'palette.tmp');
  writeFileSync(temporary, JSON.stringify(artifact), { mode: 0o600 });
  renameSync(temporary, join(probe, 'palette.json'));
  (report.publications ??= []).push({ observedAtMs: Date.now(), sha256: hash(join(probe, 'palette.json')) });
}
async function bounded<T>(promise: Promise<T>, label: string, milliseconds = 30000): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  try { return await Promise.race([promise, new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${milliseconds}ms`)), milliseconds);
  })]); } finally { clearTimeout(timer!); }
}
async function until(predicate: () => Promise<boolean>, message: string) {
  const deadline = Date.now() + 45000;
  while (!await predicate()) {
    if (Date.now() > deadline) throw new Error(message);
    await Bun.sleep(20);
  }
}
async function waitPaint(expected: string, name: string, input = false) {
  const path = join(output, `${name}.png`);
  let sample: any;
  try { await until(async () => {
    await app.screenshot({ path });
    const bounds = await app.getByTestId('music-root').bounds();
    const field = input ? await app.getByTestId('prompt-input').bounds() : undefined;
    const point = field ? [field.x + field.width - 3, field.y + 3] : [5, 100];
    const result = spawnSync('python3', ['-c', `import json,sys
from PIL import Image
image=Image.open(sys.argv[1]); rgb=image.convert('RGB'); bounds=json.loads(sys.argv[2]); point=json.loads(sys.argv[3])
x=round(point[0]*image.width/bounds['width']); y=round(point[1]*image.height/bounds['height'])
print(json.dumps(dict(size=image.size,mode=image.mode,profileKeys=list(image.info.keys()),point=[x,y],rgb=rgb.getpixel((x,y)))))`, path, JSON.stringify(bounds), JSON.stringify(point)], { encoding: 'utf8' });
    if (result.status !== 0) throw new Error(result.stderr);
    sample = JSON.parse(result.stdout);
    return sample.rgb.map((n: number) => n.toString(16).padStart(2, '0')).join('') === expected.slice(1);
  }, `pixels did not adopt ${name} (${expected})`); }
  catch (error) { throw new Error(`${error}; last sample ${JSON.stringify(sample)}`); }
  return { screenshot: `${name}.png`, sha256: hash(path), sample };
}
publish(fixture.cases[0].artifact);
const child = spawn(binary, ['--demo', '--theme-probe'], { cwd: root,
  env: { ...process.env, GPUIX_BACKGROUND: interactive ? '0' : '1', MUSIC_UI_THEME_PROBE_DIR: probe }, stdio: ['pipe', 'pipe', 'pipe'] });
let stderr = '';
child.stderr.on('data', chunk => { stderr += chunk.toString(); });
const exited = new Promise<never>((_, reject) => child.once('exit', (code, signal) => reject(new Error(`Native process exited: code=${code} signal=${signal}; ${stderr}`))));
void exited.catch(() => {});
let app: Awaited<ReturnType<typeof connectStdio>>;
try {
  app = await bounded(Promise.race([connectStdio({ write: chunk => { child.stdin.write(chunk); },
    feed: listener => { child.stdout.on('data', chunk => listener(chunk.toString())); }, close: async () => { child.kill(); } }), exited]), 'connect');
  const call = app.call.bind(app);
  app.call = ((method: any, params: any) => bounded(Promise.race([call(method, params), exited]), method)) as typeof app.call;
  await app.getByTestId('music-root').waitFor({ timeoutMs: 8000 });
  for (const [index, item] of (interactive ? [] : fixture.cases).entries()) {
    report.phase = `ramp:${item.name}`;
    publish(item.artifact);
    const capture = await waitPaint(item.expectedBackground, `${String(index + 1).padStart(2, '0')}-${item.name}`);
    const bounds = await app.getByTestId('music-root').bounds();
    report.cases.push({ name: item.name, expectedBackground: item.expectedBackground, ...capture, rootBounds: bounds });
    console.log(`${item.name}: native screenshot captured`);
  }
  const initial = JSON.parse(readFileSync(join(root, 'tests/fixtures/palette/ok.json'), 'utf8'));
  report.phase = 'input:open';
  initial.track.file = 'sample/loveless/0';
  publish(initial);
  await waitPaint(initial.roles.background.hex, 'input-palette');
  // GPUIX 0.7 simulate_click can abort in its text-selection MouseUp handler.
  // Use the ordinary keyboard action here; OS click-through is a separate probe.
  await app.call('keystrokes', { keys: ':' });
  const input = app.getByTestId('prompt-input');
  const before = await input.waitFor();
  await app.getByTestId('prompt-input-placeholder').waitFor();
  await app.screenshot({ path: join(output, 'input-before.png') });
  const beforePlaceholder = await app.getByTestId('prompt-input-placeholder').element();
  report.input = { before, beforePlaceholder };
  const replacement = fixture.cases.find((item: any) => item.expectedBackground === '#ffffff').artifact;
  if (interactive) {
    report.interactive = { pid: child.pid, input: before, observations: [],
      limitation: 'OS actions and their dispatch timestamps are recorded separately. These captures do not themselves measure isolated native-to-JS bridge latency.' };
    console.log(`Interactive probe PID ${child.pid}; app ${dirname(dirname(dirname(binary)))}; output ${output}`);
    console.log('Commands: capture NAME, white, dark, blur, arm-white, quit. Use OS input only in this probe window.');
    const commands = createInterface({ input: process.stdin });
    try { for await (const command of commands) {
      if (command === 'quit') break;
      if (command === 'white') { publish(replacement); await waitPaint('#ffffff', 'interactive-white', true); }
      else if (command === 'dark') { publish(initial); await waitPaint(initial.roles.background.hex, 'interactive-dark', true); }
      else if (command === 'blur') await app.call('blur', {});
      else if (command === 'arm-white') {
        const armedAtMs = Date.now();
        console.log(`Armed for real dead-key pre-edit at ${armedAtMs}`);
        let event: any;
        await until(async () => {
          try { event = readFileSync(join(probe, 'native-events.jsonl'), 'utf8').trim().split('\n').map(line => JSON.parse(line))
            .find(item => item.observedAtMs >= armedAtMs && item.eventType === 'change' && item.value === '´'); } catch {}
          return !!event;
        }, 'No real dead-key pre-edit arrived while armed');
        publish(replacement);
        const publishedAtMs = Date.now();
        const capture = await waitPaint('#ffffff', 'composition-publication', true);
        report.interactive.compositionPublication = { armedAtMs, event, publishedAtMs, capturedAtMs: Date.now(), ...capture };
        writeFileSync(join(output, 'interactive.json'), JSON.stringify(report.interactive, null, 2) + '\n');
      }
      else if (/^capture [a-z0-9-]+$/.test(command)) {
        const name = command.slice(8), startedAtMs = Date.now();
        const tree = await app.getByTestId('music-root').element();
        const painted = await app.call('getPaintedText', {});
        await app.screenshot({ path: join(output, `${name}.png`) });
        report.interactive.observations.push({ name, startedAtMs, completedAtMs: Date.now(), tree, painted,
          screenshot: `${name}.png`, sha256: hash(join(output, `${name}.png`)) });
        writeFileSync(join(output, 'interactive.json'), JSON.stringify(report.interactive, null, 2) + '\n');
      }
      console.log(`Recorded: ${command}`);
    } } finally { commands.close(); process.stdin.pause(); }
  } else {
  report.phase = 'input:placeholder-publication';
  publish(replacement);
  await waitPaint('#ffffff', 'input-after', true);
  const after = await input.element(), afterPlaceholder = await app.getByTestId('prompt-input-placeholder').element();
  Object.assign(report.input, { after, afterPlaceholder, sameInput: before.id === after.id });
  report.phase = 'input:typing-publication';
  await input.fill('theme');
  await until(async () => (await app.call('getPaintedText', {})).text.includes('theme'), 'query not painted');
  publish(initial);
  await waitPaint(initial.roles.background.hex, 'input-typed-palette', true);
  await app.call('keystrokes', { keys: 'x' });
  await until(async () => (await app.call('getPaintedText', {})).text.includes('themex'), 'typing focus lost');
  await app.screenshot({ path: join(output, 'input-typed.png') });
  const typed = await input.element();
  const paintedText = await app.call('getPaintedText', {});
  Object.assign(report.input, { typed, sameInput: before.id === after.id && after.id === typed.id,
    queryAndFocusRetained: paintedText.text.includes('themex'), paintedText });
  report.phase = 'input:empty-latch';
  await app.call('keystrokes', { keys: 'cmd-a backspace' });
  await until(async () => !(await app.call('getPaintedText', {})).text.includes('themex'), 'clear query');
  const hiddenAfterEmpty = await app.getByTestId('prompt-input-placeholder').count() === 0;
  Object.assign(report.input, { hiddenAfterEmpty,
    note: 'Ordinary synthetic typing and empty-echo latch only. Real IME and blur-reset evidence require a separately OS-activated interactive probe: GPUI focus callbacks depend on window-active state and a rendered frame.' });
  report.phase = 'navigation';
  await input.press('escape');
  await app.call('keystrokes', { keys: 'cmd-3' });
  await Bun.sleep(200);
  }
} catch (error) {
  report.error = error instanceof Error ? error.stack : String(error);
  try { report.lastRoot = await app!.getByTestId('music-root').element(); await app!.screenshot({ path: join(output, 'failure.png') }); } catch {}
  console.error(report.error);
} finally {
  if (app!) await app.close(); else child.kill();
  await bounded(exited.catch(() => {}), 'native shutdown', 2000).catch(() => child.kill('SIGKILL'));
  child.stdin.destroy(); child.stdout.destroy(); child.stderr.destroy();
  report.stderr = stderr;
  for (const [key, directory] of [['state', 'state'], ['journal', 'navigation']]) {
    try { report[key!] = readdirSync(join(probe, directory!)).map(name => ({ name, sha256: hash(join(probe, directory!, name)) })); }
    catch { report[key!] = []; }
  }
  // Sample a fixed blank canvas patch, not arbitrary matching colors elsewhere.
  const samples = spawnSync('python3', ['-c', `import json,sys
from pathlib import Path
from PIL import Image
root=Path(sys.argv[1]); cases=json.loads(sys.argv[2]); result=[]
for case in cases:
 image=Image.open(root/case['screenshot']); rgb=image.convert('RGB'); bounds=case['rootBounds']
 sx=image.width/bounds['width']; sy=image.height/bounds['height']
 x=round(5*sx); y=round(100*sy)
 samples=[rgb.getpixel((x+dx,y+dy)) for dx in range(4) for dy in range(4)]
 expected=tuple(int(case['expectedBackground'][i:i+2],16) for i in (1,3,5))
 result.append(dict(name=case['name'],size=image.size,mode=image.mode,profileKeys=list(image.info.keys()),samplePoint=[x,y],rgb=sorted(set(samples)),exact=all(p==expected for p in samples)))
print(json.dumps(result))`, output, JSON.stringify(report.cases)], { encoding: 'utf8' });
  if (samples.status === 0) report.pixelSamples = JSON.parse(samples.stdout);
  else report.pixelSamplingError = samples.stderr;
  report.passed = !report.error && report.cases.length === fixture.cases.length && report.pixelSamples?.every((sample: any) => sample.exact)
    && report.input?.sameInput && report.input?.queryAndFocusRetained && report.input?.hiddenAfterEmpty && report.state.length > 0 && report.journal.length > 0;
  writeFileSync(join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(`Report: ${join(output, 'report.json')}`);
  if (report.error || (!report.passed && !interactive)) process.exitCode = 1;
}
