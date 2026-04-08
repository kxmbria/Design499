# Personal Link Dashboard (Astro + HTMX + Alpine + SQLite)

This project is a minimal new-tab dashboard for organizing links by category.

## Minimum features included
- Categories to organize links
- Add a link with name and URL
- Edit a link
- Delete a link
- Add and delete categories
- Store data in SQLite
- Run on localhost

## Tech stack (recommended for your class)
- **Astro** for project structure and local dev server
- **HTMX** to refresh the dashboard list HTML
- **Alpine.js** for simple form state (add/edit)
- **JavaScript** for all client interactions
- **SQLite** via `better-sqlite3` for local database storage

## File structure (beginner-friendly)
- `src/pages/index.astro`  
  Main page UI (forms + dashboard container + Alpine/HTMX behavior).
- `src/styles/global.css`  
  Clean, minimal styles.
- `src/lib/db.js`  
  SQLite connection, table creation, and database helper functions.
- `src/lib/renderDashboard.js`  
  Converts category/link data into dashboard HTML cards.
- `src/pages/api/dashboard.json.js`  
  Returns categories/links as JSON.
- `src/pages/api/dashboard-html.js`  
  Returns ready-to-render dashboard HTML for HTMX.
- `src/pages/api/categories/index.js`  
  `POST` create category.
- `src/pages/api/categories/[id]/index.js`  
  `DELETE` category.
- `src/pages/api/links/index.js`  
  `POST` create link.
- `src/pages/api/links/[id]/index.js`  
  `PUT` update link, `DELETE` link.
- `dashboard.db`  
  SQLite file (auto-created when the app runs).

## Run locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start dev server:
   ```bash
   npm run dev
   ```
3. Open:
   `http://127.0.0.1:4321`

## API routes
- `GET /api/dashboard.json`
- `GET /api/dashboard-html`
- `POST /api/categories`
- `DELETE /api/categories/:id`
- `POST /api/links`
- `PUT /api/links/:id`
- `DELETE /api/links/:id`
