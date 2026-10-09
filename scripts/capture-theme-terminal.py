#!/usr/bin/env python3
"""Capture the built demo app's synthetic ramp in a PTY, not an emulator screenshot.

Build first with `bun run build`, then run this script. All published palettes,
navigation state, journals and evidence remain under a new private output folder.
The report proves truecolor ANSI serialization, not terminal display fidelity.
"""

import argparse
import errno
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import select
import signal
import struct
import subprocess
import sys
import tempfile
import termios
import time


ROOT = Path(__file__).resolve().parent.parent
SGR = re.compile(rb"\x1b\[([0-9;:]*)m")
PRIVATE_MODE = re.compile(rb"\x1b\[\?([0-9;]+)([hl])")
WIDTH, HEIGHT = 120, 36


def background_colors(data):
    """Read both standard SGR 48;2;r;g;b and colon-form truecolor encodings."""
    colors = []
    for match in SGR.finditer(data):
        fields = match.group(1).decode("ascii").split(";")
        i = 0
        while i < len(fields):
            if fields[i] == "48" and i + 4 < len(fields) and fields[i + 1] == "2":
                rgb = fields[i + 2:i + 5]
                if all(n.isdigit() and 0 <= int(n) <= 255 for n in rgb):
                    colors.append(tuple(map(int, rgb)))
                i += 5
            elif fields[i].startswith("48:2:"):
                parts = fields[i].split(":")
                rgb = parts[-3:]
                if len(parts) in (5, 6) and all(n.isdigit() and 0 <= int(n) <= 255 for n in rgb):
                    colors.append(tuple(map(int, rgb)))
                i += 1
            else:
                i += 1
    return colors


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def publish(path, artifact):
    """A complete artifact is visible at one rename boundary."""
    fd, name = tempfile.mkstemp(prefix=".palette-", suffix=".tmp", dir=path.parent)
    try:
        with os.fdopen(fd, "w") as stream:
            json.dump(artifact, stream)
            stream.write("\n")
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--binary", type=Path, default=ROOT / "dist/music-ui")
    parser.add_argument("--fixture", type=Path, default=ROOT / "tests/fixtures/palette/host-ramp.json")
    parser.add_argument("--output", type=Path, help="New directory; defaults to a private temporary directory (preserved).")
    parser.add_argument("--case", action="append", dest="names", help="Capture only this named ramp case; may repeat.")
    parser.add_argument("--timeout", type=float, default=8, help="Seconds allowed for each palette publication (default: 8).")
    args = parser.parse_args()
    if not 0 < args.timeout <= 60:
        parser.error("--timeout must be greater than zero and at most 60 seconds")
    binary, fixture = args.binary.resolve(), args.fixture.resolve()
    if not binary.is_file() or not os.access(binary, os.X_OK):
        parser.error(f"built executable unavailable: {binary}; build before capturing")
    document = json.loads(fixture.read_text())
    cases = document["cases"]
    if args.names:
        missing = set(args.names) - {case["name"] for case in cases}
        if missing:
            parser.error("unknown fixture case: " + ", ".join(sorted(missing)))
        cases = [case for case in cases if case["name"] in args.names]
    if not cases:
        parser.error("fixture has no cases")
    for case in cases:
        if not re.fullmatch(r"[a-zA-Z0-9_-]+", case["name"]):
            parser.error("fixture case names must be safe filename components")
        if not re.fullmatch(r"#[0-9a-fA-F]{6}", case["expectedBackground"]):
            parser.error("fixture expectedBackground must be #rrggbb")
        if case["artifact"]["track"]["file"] != "sample/loveless/0":
            parser.error("fixture must target the initial demo URI sample/loveless/0")
    output = args.output.absolute() if args.output else Path(tempfile.mkdtemp(prefix="grisaille-theme-tui-"))
    if args.output:
        output.mkdir(mode=0o700, parents=True, exist_ok=False)
    os.chmod(output, 0o700)
    probe = output / "probe"
    probe.mkdir(mode=0o700)
    palette = probe / "palette.json"
    publish(palette, cases[0]["artifact"])
    command = [str(binary), "--tui", "--demo", "--no-images", "--theme-probe"]
    env = os.environ.copy()
    env.update(TERM="xterm-256color", COLORTERM="truecolor", MUSIC_UI_THEME_PROBE_DIR=str(probe))
    report = {
        "evidence": "Real PTY, built app, demo playback, synthetic palette artifacts; truecolor ANSI serialization only. No terminal-emulator pixels or display fidelity claim.",
        "fixture_note": document["fixture_note"],
        "fixture": str(fixture), "fixture_sha256": digest(fixture),
        "binary": str(binary), "binary_sha256": digest(binary), "command": command,
        "output": str(output), "probe_directory": str(probe),
        "terminal": {"TERM": env["TERM"], "COLORTERM": env["COLORTERM"], "columns": WIDTH, "rows": HEIGHT},
        "cases": [], "forced_termination": False,
    }
    master, slave = os.openpty()
    fcntl.ioctl(slave, termios.TIOCSWINSZ, struct.pack("HHHH", HEIGHT, WIDTH, 0, 0))
    before = termios.tcgetattr(slave)
    raw = bytearray()
    child = None
    closed = False

    def pump(wait=0.05):
        nonlocal closed
        if closed:
            return
        ready, _, _ = select.select([master], [], [], wait)
        if not ready:
            return
        try:
            chunk = os.read(master, 65536)
        except OSError as error:
            if error.errno != errno.EIO:
                raise
            chunk = b""
        if not chunk:
            closed = True
        raw.extend(chunk)
        if len(raw) > 128 * 1024 * 1024:
            raise RuntimeError("PTY capture exceeded 128 MiB")

    def drain_for(seconds):
        deadline = time.monotonic() + seconds
        while time.monotonic() < deadline and not closed:
            pump(min(0.05, max(0, deadline - time.monotonic())))

    try:
        child = subprocess.Popen(command, stdin=slave, stdout=slave, stderr=slave,
                                 cwd=ROOT, env=env, start_new_session=True, close_fds=True)
        report["pid"] = child.pid
        for index, case in enumerate(cases):
            if child.poll() is not None:
                raise RuntimeError(f"app exited before {case['name']}: {child.returncode}")
            # Consume older frames before each publication; the first includes startup.
            if index:
                drain_for(0.1)
            start = len(raw)
            publish(palette, case["artifact"])
            began = time.monotonic()
            expected = tuple(int(case["expectedBackground"][n:n + 2], 16) for n in (1, 3, 5))
            found = False
            while time.monotonic() - began < args.timeout:
                pump()
                if expected in background_colors(raw[start:]):
                    found = True
                    break
                if child.poll() is not None:
                    break
            observed_after_ms = round((time.monotonic() - began) * 1000, 2) if found else None
            drain_for(0.2)
            captured = bytes(raw[start:])
            ansi_name = f"{index + 1:02d}-{case['name']}.ansi"
            (output / ansi_name).write_bytes(captured)
            colors = background_colors(captured)
            result = {"name": case["name"], "expectedBackground": case["expectedBackground"],
                      "expected_rgb": expected, "observed_expected": found,
                      "observed_after_ms": observed_after_ms, "expected_sgr_count": colors.count(expected),
                      "observed_background_rgb": sorted(set(colors)), "raw_ansi": ansi_name,
                      "raw_start": start, "raw_end": len(raw), "raw_sha256": digest(output / ansi_name)}
            report["cases"].append(result)
            print(f"{case['name']}: {'observed' if found else 'MISSING'} {case['expectedBackground']}", flush=True)
            if not found:
                raise RuntimeError(f"expected background was not serialized for {case['name']}")
        # A harmless browsing move exercises both isolated snapshot and journal writes.
        os.write(master, b"j")
        drain_for(0.4)
        os.write(master, b"q")
        deadline = time.monotonic() + 4
        while child.poll() is None and time.monotonic() < deadline:
            pump()
        if child.poll() is None:
            raise RuntimeError("app did not exit after its normal q command")
    except (Exception, KeyboardInterrupt) as error:
        report["error"] = f"{type(error).__name__}: {error}"
    finally:
        if child is not None and child.poll() is None:
            report["forced_termination"] = True
            os.killpg(child.pid, signal.SIGTERM)
            try:
                child.wait(timeout=2)
            except subprocess.TimeoutExpired:
                os.killpg(child.pid, signal.SIGKILL)
                child.wait(timeout=2)
        drain_for(0.2)
        report["exit_code"] = child.returncode if child else None
        report["termios_restored"] = termios.tcgetattr(slave) == before
        modes = {}
        for match in PRIVATE_MODE.finditer(raw):
            for mode in match.group(1).split(b";"):
                modes[int(mode)] = match.group(2) == b"h"
        report["alternate_screen_restored"] = modes.get(1049) is False
        report["cursor_shown_at_exit"] = modes.get(25) is True
        os.close(master)
        os.close(slave)
        (output / "session.ansi").write_bytes(raw)
        report["session_ansi_sha256"] = digest(output / "session.ansi")
        report["isolated_state_files"] = sorted(str(path.relative_to(output)) for path in (probe / "state").glob("*.json"))
        report["isolated_navigation_files"] = sorted(str(path.relative_to(output)) for path in (probe / "navigation").glob("*.jsonl"))
        report["passed"] = bool(
            not report.get("error") and not report["forced_termination"] and report["exit_code"] == 0
            and len(report["cases"]) == len(cases) and all(case["observed_expected"] for case in report["cases"])
            and report["termios_restored"] and report["alternate_screen_restored"] and report["cursor_shown_at_exit"]
            and report["isolated_state_files"] and report["isolated_navigation_files"]
        )
        (output / "report.json").write_text(json.dumps(report, indent=2) + "\n")
    print(f"Report: {output / 'report.json'}")
    return 0 if report["passed"] else 1


if __name__ == "__main__":
    sys.exit(main())
