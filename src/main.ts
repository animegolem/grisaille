export {};
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Music Prototype\n\n  music-ui                       Native GUI connected to MPD\n  music-ui --tui                 Terminal view connected to MPD\n  music-ui --tui --demo          Simulated sample session\n  music-ui --tui --no-images     Use coloured block artwork\n\nBoth views: --demo selects simulated playback. MPD_HOST / MPD_PORT select the server.\nPages: Now playing, Lyrics, Library (GUI Cmd+1/2/3; terminal F1/F2/F3).\nLyrics: local LRC/text sidecars; MUSIC_UI_LYRICS_DIR overrides the lyric root.');
} else if (process.argv.includes('--tui')) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.error('Terminal mode needs an interactive terminal. Run music-ui --tui in Ghostty, Kitty, or another terminal.');
    process.exitCode = 1;
  } else await import('./terminal/main');
} else await import('./app');
