import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dbPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../dashboard.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

db.exec(`
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
`);

export function getDashboardData() {
  const categories = db
    .prepare('SELECT id, name FROM categories ORDER BY lower(name)')
    .all();

  const links = db
    .prepare('SELECT id, name, url, category_id FROM links ORDER BY lower(name)')
    .all();

  return categories.map((category) => ({
    ...category,
    links: links.filter((link) => link.category_id === category.id)
  }));
}

export function addCategory(name) {
  return db.prepare('INSERT INTO categories(name) VALUES (?)').run(name);
}

export function deleteCategory(id) {
  return db.prepare('DELETE FROM categories WHERE id = ?').run(id);
}

export function addLink(name, url, categoryId) {
  return db
    .prepare('INSERT INTO links(name, url, category_id) VALUES (?, ?, ?)')
    .run(name, url, categoryId);
}

export function updateLink(id, name, url, categoryId) {
  return db
    .prepare('UPDATE links SET name = ?, url = ?, category_id = ? WHERE id = ?')
    .run(name, url, categoryId, id);
}

export function deleteLink(id) {
  return db.prepare('DELETE FROM links WHERE id = ?').run(id);
}
