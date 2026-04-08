from __future__ import annotations

import json
import sqlite3
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "dashboard.db"
TEMPLATE_PATH = BASE_DIR / "templates" / "index.html"
STATIC_DIR = BASE_DIR / "static"


def init_db() -> None:
    """Create database tables if they do not exist."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        );

        CREATE TABLE IF NOT EXISTS links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            url TEXT NOT NULL,
            category_id INTEGER NOT NULL,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        );
        """
    )
    conn.commit()
    conn.close()


class DashboardHandler(SimpleHTTPRequestHandler):
    """Serve the frontend and simple JSON API endpoints."""

    def _db(self) -> sqlite3.Connection:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn

    def _read_json_body(self) -> dict:
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length) if length else b"{}"
        return json.loads(raw.decode("utf-8") or "{}")

    def _send_json(self, payload: dict | list, status: int = 200) -> None:
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _send_file(self, path: Path, content_type: str) -> None:
        if not path.exists():
            self.send_error(404, "File not found")
            return
        content = path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)

        if parsed.path == "/":
            self._send_file(TEMPLATE_PATH, "text/html; charset=utf-8")
            return

        if parsed.path == "/static/styles.css":
            self._send_file(STATIC_DIR / "styles.css", "text/css; charset=utf-8")
            return

        if parsed.path == "/static/app.js":
            self._send_file(STATIC_DIR / "app.js", "application/javascript; charset=utf-8")
            return

        if parsed.path == "/api/dashboard":
            conn = self._db()
            categories = conn.execute(
                "SELECT id, name FROM categories ORDER BY LOWER(name)"
            ).fetchall()
            links = conn.execute(
                "SELECT id, name, url, category_id FROM links ORDER BY LOWER(name)"
            ).fetchall()
            conn.close()

            grouped: dict[int, list[dict]] = {}
            for link in links:
                grouped.setdefault(link["category_id"], []).append(
                    {"id": link["id"], "name": link["name"], "url": link["url"]}
                )

            payload = [
                {
                    "id": category["id"],
                    "name": category["name"],
                    "links": grouped.get(category["id"], []),
                }
                for category in categories
            ]
            self._send_json(payload)
            return

        self.send_error(404, "Not found")

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)

        if parsed.path == "/api/categories":
            body = self._read_json_body()
            name = (body.get("name") or "").strip()
            if not name:
                self._send_json({"error": "Category name is required."}, 400)
                return

            conn = self._db()
            try:
                cur = conn.execute("INSERT INTO categories(name) VALUES (?)", (name,))
                conn.commit()
            except sqlite3.IntegrityError:
                conn.close()
                self._send_json({"error": "Category already exists."}, 409)
                return
            conn.close()
            self._send_json({"id": cur.lastrowid, "name": name}, 201)
            return

        if parsed.path == "/api/links":
            body = self._read_json_body()
            name = (body.get("name") or "").strip()
            url = (body.get("url") or "").strip()
            category_id = body.get("category_id")

            if not name or not url or not category_id:
                self._send_json({"error": "Name, URL, and category are required."}, 400)
                return

            conn = self._db()
            try:
                cur = conn.execute(
                    "INSERT INTO links(name, url, category_id) VALUES (?, ?, ?)",
                    (name, url, category_id),
                )
                conn.commit()
            except sqlite3.IntegrityError:
                conn.close()
                self._send_json({"error": "Invalid category."}, 400)
                return
            conn.close()
            self._send_json(
                {"id": cur.lastrowid, "name": name, "url": url, "category_id": category_id},
                201,
            )
            return

        self.send_error(404, "Not found")

    def do_PUT(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if not parsed.path.startswith("/api/links/"):
            self.send_error(404, "Not found")
            return

        link_id = parsed.path.split("/")[-1]
        if not link_id.isdigit():
            self._send_json({"error": "Invalid link id."}, 400)
            return

        body = self._read_json_body()
        name = (body.get("name") or "").strip()
        url = (body.get("url") or "").strip()
        category_id = body.get("category_id")

        if not name or not url or not category_id:
            self._send_json({"error": "Name, URL, and category are required."}, 400)
            return

        conn = self._db()
        try:
            cur = conn.execute(
                "UPDATE links SET name = ?, url = ?, category_id = ? WHERE id = ?",
                (name, url, category_id, int(link_id)),
            )
            conn.commit()
        except sqlite3.IntegrityError:
            conn.close()
            self._send_json({"error": "Invalid category."}, 400)
            return

        if cur.rowcount == 0:
            conn.close()
            self._send_json({"error": "Link not found."}, 404)
            return

        conn.close()
        self._send_json({"ok": True})

    def do_DELETE(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)

        if parsed.path.startswith("/api/categories/"):
            category_id = parsed.path.split("/")[-1]
            if not category_id.isdigit():
                self._send_json({"error": "Invalid category id."}, 400)
                return

            conn = self._db()
            cur = conn.execute("DELETE FROM categories WHERE id = ?", (int(category_id),))
            conn.commit()
            conn.close()
            if cur.rowcount == 0:
                self._send_json({"error": "Category not found."}, 404)
                return
            self._send_json({"ok": True})
            return

        if parsed.path.startswith("/api/links/"):
            link_id = parsed.path.split("/")[-1]
            if not link_id.isdigit():
                self._send_json({"error": "Invalid link id."}, 400)
                return

            conn = self._db()
            cur = conn.execute("DELETE FROM links WHERE id = ?", (int(link_id),))
            conn.commit()
            conn.close()
            if cur.rowcount == 0:
                self._send_json({"error": "Link not found."}, 404)
                return
            self._send_json({"ok": True})
            return

        self.send_error(404, "Not found")


def run_server(port: int = 8000) -> None:
    init_db()
    server = ThreadingHTTPServer(("127.0.0.1", port), DashboardHandler)
    print(f"Dashboard running at http://127.0.0.1:{port}")
    server.serve_forever()


if __name__ == "__main__":
    run_server()
