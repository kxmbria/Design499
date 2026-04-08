import { addCategory } from '../../../lib/db.js';

export async function POST({ request }) {
  const body = await request.json();
  const name = (body.name || '').trim();

  if (!name) {
    return Response.json({ error: 'Category name is required.' }, { status: 400 });
  }

  try {
    const result = addCategory(name);
    return Response.json({ id: result.lastInsertRowid, name }, { status: 201 });
  } catch {
    return Response.json({ error: 'Category already exists.' }, { status: 409 });
  }
}
