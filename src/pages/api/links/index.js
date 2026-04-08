import { addLink } from '../../../lib/db.js';

export async function POST({ request }) {
  const body = await request.json();
  const name = (body.name || '').trim();
  const url = (body.url || '').trim();
  const categoryId = Number(body.category_id);

  if (!name || !url || !Number.isInteger(categoryId)) {
    return Response.json({ error: 'Name, URL, and category are required.' }, { status: 400 });
  }

  try {
    const result = addLink(name, url, categoryId);
    return Response.json(
      { id: result.lastInsertRowid, name, url, category_id: categoryId },
      { status: 201 }
    );
  } catch {
    return Response.json({ error: 'Invalid category.' }, { status: 400 });
  }
}
