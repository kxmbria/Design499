# Personal Link Dashboard (Astro + JavaScript + SQLite)

A clean, minimal new-tab dashboard for managing personal links.

## Features (minimum requirements)
- Categories to organize links
- Add a link with name + URL
- Edit a link
- Delete a link
- Add and delete categories
- Persist data in SQLite
- Run locally on localhost

## Project structure
- `src/pages/index.astro`  
  Main page layout (forms + dashboard containers).
- `src/scripts/dashboard.js`  
  Beginner-friendly frontend logic for loading data and handling add/edit/delete actions.
- `src/styles/global.css`  
  Minimal styling.
- `src/lib/db.js`  
  SQLite connection and CRUD helper functions.
- `src/pages/api/categories/index.js`  
  `POST /api/categories` (create category).
- `src/pages/api/categories/[id]/index.js`  
  `DELETE /api/categories/:id`.
- `src/pages/api/links/index.js`  
  `POST /api/links` (create link).
- `src/pages/api/links/[id]/index.js`  
  `PUT /api/links/:id` and `DELETE /api/links/:id`.
- `src/pages/api/dashboard.json.js`  
  `GET /api/dashboard.json` (categories and links grouped together).
- `dashboard.db`  
  Local SQLite database file (auto-created).

## Run locally (Codespaces or local machine)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the app:
   ```bash
   npm run dev
   ```
3. Open:
   `http://127.0.0.1:4321`

## API routes
- `GET /api/dashboard.json`
- `POST /api/categories`
- `DELETE /api/categories/:id`
- `POST /api/links`
- `PUT /api/links/:id`
- `DELETE /api/links/:id`
