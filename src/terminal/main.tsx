/** @jsxImportSource @opentui/react */
import { createCliRenderer } from '@opentui/core';
import { createRoot } from '@opentui/react';
import { DemoBackend } from '../demo';
import { MpdBackend } from '../mpd';
import { MusicSession } from '../music-session';
import { NavigationLog } from '../navigation-log';
import { TerminalApp } from './app';

const demo = process.argv.includes('--demo');
const session = new MusicSession(demo ? new DemoBackend() : new MpdBackend());
const journal = new NavigationLog(demo ? 'demo' : 'mpd', undefined, 'tui');
const renderer = await createCliRenderer({ exitOnCtrlC: false, useMouse: false, screenMode: 'alternate-screen', onDestroy: () => session.stop() });
const root = createRoot(renderer);
function quit() { root.unmount(); session.stop(); renderer.destroy(); }
root.render(<TerminalApp session={session} record={event => journal.append(event)} logError={() => journal.error} quit={quit} protocol={process.argv.includes('--no-images') ? 'blocks' : 'auto'} />);
