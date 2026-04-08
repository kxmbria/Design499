import { deleteCategory } from '../../../../lib/db.js';

export function DELETE({ params }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return Response.json({ error: 'Invalid category id.' }, { status: 400 });
  }

  const result = deleteCategory(id);
  if (!result.changes) {
    return Response.json({ error: 'Category not found.' }, { status: 404 });
  }

  return Response.json({ ok: true });
}
