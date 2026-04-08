export function renderDashboardHtml(categories) {
  if (!categories.length) {
    return '<p class="empty">Create your first category to start saving links.</p>';
  }

  return categories
    .map(
      (category) => `
      <article class="category-card">
        <div class="category-head">
          <h3>${escapeHtml(category.name)}</h3>
          <button class="danger" onclick="deleteCategory(${category.id})">Delete</button>
        </div>
        ${
          category.links.length
            ? `<ul class="links">
                ${category.links
                  .map(
                    (link) => `
                    <li class="link-row">
                      <a href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer noopener">${escapeHtml(link.name)}</a>
                      <div class="row-actions">
                        <button class="ghost" onclick='startEdit(${JSON.stringify(link).replace(/'/g, '&#39;')}, ${category.id})'>Edit</button>
                        <button class="danger" onclick="deleteLink(${link.id})">Delete</button>
                      </div>
                    </li>
                  `
                  )
                  .join('')}
              </ul>`
            : '<p class="empty">No links yet.</p>'
        }
      </article>
    `
    )
    .join('');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
