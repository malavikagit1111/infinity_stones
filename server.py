"""Tiny dependency-free local backend for INFINITY.EXE.

Run with: python server.py
Then visit: http://localhost:8000

It serves the frontend and keeps the current demo session in memory. No database,
accounts, or API keys are required, which keeps the project easy to ZIP and run.
"""

from __future__ import annotations

import json
import mimetypes
import secrets
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

PROJECT_ROOT = Path(__file__).resolve().parent
SESSIONS: dict[str, dict] = {}


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


class InfinityHandler(SimpleHTTPRequestHandler):
    """Static-file server plus a very small JSON API."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PROJECT_ROOT), **kwargs)

    def log_message(self, format, *args):
        # Friendly, compact terminal output while demonstrating.
        print(f"[{now()}] {format % args}")

    def send_json(self, payload: dict, status: HTTPStatus = HTTPStatus.OK):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def read_json(self) -> dict:
        try:
            length = int(self.headers.get("Content-Length", "0"))
            return json.loads(self.rfile.read(length).decode("utf-8")) if length else {}
        except (ValueError, json.JSONDecodeError):
            return {}

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/health":
            return self.send_json({"ok": True, "service": "INFINITY.EXE local backend", "time": now()})
        if path.startswith("/api/session/"):
            session_id = path.rsplit("/", 1)[-1]
            session = SESSIONS.get(session_id)
            if not session:
                return self.send_json({"ok": False, "error": "Session not found"}, HTTPStatus.NOT_FOUND)
            return self.send_json({"ok": True, "session": session})
        return super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        payload = self.read_json()
        if path == "/api/session":
            session_id = secrets.token_urlsafe(10)
            session = {"id": session_id, "createdAt": now(), "stones": [], "events": [], "snapped": False}
            SESSIONS[session_id] = session
            return self.send_json({"ok": True, "session": session}, HTTPStatus.CREATED)

        if path == "/api/events":
            session_id = payload.get("sessionId")
            event = payload.get("event")
            if not session_id or not event or session_id not in SESSIONS:
                return self.send_json({"ok": False, "error": "Valid sessionId and event are required"}, HTTPStatus.BAD_REQUEST)
            session = SESSIONS[session_id]
            entry = {"event": str(event)[:64], "details": payload.get("details", {}), "at": now()}
            session["events"].append(entry)
            if event == "stone_collected":
                stone = str(payload.get("details", {}).get("stone", ""))
                if stone and stone not in session["stones"]:
                    session["stones"].append(stone)
            if event == "universe_snapped":
                session["snapped"] = True
            if event == "universe_reset":
                session.update({"stones": [], "events": [entry], "snapped": False})
            return self.send_json({"ok": True, "session": session})

        return self.send_json({"ok": False, "error": "Unknown API route"}, HTTPStatus.NOT_FOUND)


if __name__ == "__main__":
    print("INFINITY.EXE backend running at http://localhost:8000")
    ThreadingHTTPServer(("127.0.0.1", 8000), InfinityHandler).serve_forever()
