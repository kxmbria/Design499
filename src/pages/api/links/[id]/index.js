import { deleteLink, updateLink } from '../../../../lib/db.js';

export async function PUT({ params, request }) {
  const id = Number(params.id);
  const body = await request.json();
  const name = (body.name || '').trim();
  const url = (body.url || '').trim();
  const categoryId = Number(body.category_id);

  if (!Number.isInteger(id) || !name || !url || !Number.isInteger(categoryId)) {
    return Response.json({ error: 'Name, URL, and category are required.' }, { status: 400 });
  }

  try {
    const result = updateLink(id, name, url, categoryId);
    if (!result.changes) {
      return Response.json({ error: 'Link not found.' }, { status: 404 });
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'Invalid category.' }, { status: 400 });
  }
}

export function DELETE({ params }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return Response.json({ error: 'Invalid link id.' }, { status: 400 });
  }

  const result = deleteLink(id);
  if (!result.changes) {
    return Response.json({ error: 'Link not found.' }, { status: 404 });
  }

  return Response.json({ ok: true });
}
