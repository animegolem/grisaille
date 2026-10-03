/** @jsxImportSource @opentui/react */
import { createCliRenderer } from '@opentui/core';
import { createRoot } from '@opentui/react';
import { DemoBackend } from '../demo';
import { PaletteSession } from '../palette-session';
import { paletteSourceFromEnvironment } from '../palette-file';
import { MpdBackend } from '../mpd';
import { MusicSession } from '../music-session';
import { NavigationLog } from '../navigation-log';
import { TerminalApp } from './app';
import { NavigationStateStore, navigationStatePath } from '../navigation-state';

const demo = process.argv.includes('--demo');
const session = new MusicSession(demo ? new DemoBackend() : new MpdBackend(), 1000, new PaletteSession(paletteSourceFromEnvironment(demo)));
const journal = new NavigationLog(demo ? 'demo' : 'mpd', undefined, 'tui');
const navigationState = new NavigationStateStore(navigationStatePath(demo ? 'demo' : 'mpd', 'tui'));
const renderer = await createCliRenderer({ exitOnCtrlC: false, useMouse: false, screenMode: 'alternate-screen', onDestroy: () => { navigationState.detach(); session.stop(); } });
const root = createRoot(renderer);
function quit() { navigationState.detach(); root.unmount(); session.stop(); renderer.destroy(); }
root.render(<TerminalApp session={session} navigationState={navigationState} record={event => journal.append(event)} logError={() => journal.error} quit={quit} protocol={process.argv.includes('--no-images') ? 'blocks' : 'auto'} />);
