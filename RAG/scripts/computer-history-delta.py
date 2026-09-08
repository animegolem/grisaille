#!/usr/bin/env python3
"""Adapt a neutral Computer History pulse to Codex UserPromptSubmit."""

from __future__ import annotations

import json
import sys
from typing import Any

import computer_history_projector as projector


def hook_output(context: str) -> dict[str, Any]:
    return {
        "hookSpecificOutput": {
            "hookEventName": "UserPromptSubmit",
            "additionalContext": context,
        }
    }


def main(argv: list[str] | None = None) -> int:
    normalized = list(argv or sys.argv[1:])
    if normalized and normalized[0] == "inject":
        normalized[0] = "pulse"
    args = projector.parse_args(normalized)
    try:
        payload = json.load(sys.stdin)
        if not isinstance(payload, dict):
            return 0
        session_id = payload.get("session_id")
        if not isinstance(session_id, str) or not session_id:
            return 0
        if args.command == "pulse":
            projection = projector.project(args, session_id)
            if projection is not None:
                print(json.dumps(hook_output(projection.context), ensure_ascii=False))
    except Exception as error:  # Hook failures must never block the prompt.
        print(f"computer-history-delta: {error}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
