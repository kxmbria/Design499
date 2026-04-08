# Personal Link Dashboard (New Tab Page)

A fast, clean dashboard you can use as a browser new-tab page.

## What this app does
- Shows links grouped by category
- Lets you add, edit, and delete links
- Lets you create and delete categories
- Stores data locally in SQLite (`dashboard.db`)

## Tech choices (beginner-friendly)
- **Frontend:** Plain HTML, CSS, JavaScript
- **Backend:** Python standard library (`http.server`)
- **Database:** SQLite (built into Python)

No frameworks or external packages are required.

## Project structure
- `app.py` — server + API routes + SQLite setup
- `templates/index.html` — main page markup
- `static/styles.css` — styling
- `static/app.js` — frontend behavior and API calls
- `dashboard.db` — SQLite database file (created automatically on first run)

## Run locally
1. Make sure you have Python 3.10+ installed.
2. From this folder, run:

```bash
python3 app.py
```

3. Open: `http://127.0.0.1:8000`

## API endpoints
- `GET /api/dashboard`
- `POST /api/categories`
- `DELETE /api/categories/:id`
- `POST /api/links`
- `PUT /api/links/:id`
- `DELETE /api/links/:id`

## Notes
- Deleting a category also deletes links inside it (cascade delete).
- The server binds to localhost only (`127.0.0.1`) for local use.
