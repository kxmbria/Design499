const dashboard = document.getElementById('dashboard');
const categoryForm = document.getElementById('category-form');
const categoryNameInput = document.getElementById('category-name');
const linkForm = document.getElementById('link-form');
const linkNameInput = document.getElementById('link-name');
const linkUrlInput = document.getElementById('link-url');
const linkCategorySelect = document.getElementById('link-category');
const formTitle = document.getElementById('form-title');
const cancelEditBtn = document.getElementById('cancel-edit');
const message = document.getElementById('message');

let categories = [];
let editingLinkId = null;

const showMessage = (text, isError = false) => {
  message.textContent = text;
  message.style.color = isError ? '#b91c1c' : '#697386';
};

const fetchJSON = async (url, options = {}) => {
  const resp = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || 'Request failed');
  return data;
};

const resetLinkForm = () => {
  editingLinkId = null;
  formTitle.textContent = 'Add Link';
  cancelEditBtn.hidden = true;
  linkForm.reset();
};

const populateCategorySelect = () => {
  linkCategorySelect.innerHTML = '';
  categories.forEach((cat) => {
    const option = document.createElement('option');
    option.value = cat.id;
    option.textContent = cat.name;
    linkCategorySelect.append(option);
  });
};

const startEdit = (link, categoryId) => {
  editingLinkId = link.id;
  formTitle.textContent = 'Edit Link';
  cancelEditBtn.hidden = false;
  linkNameInput.value = link.name;
  linkUrlInput.value = link.url;
  linkCategorySelect.value = categoryId;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const render = () => {
  populateCategorySelect();
  dashboard.innerHTML = '';

  if (!categories.length) {
    dashboard.innerHTML = '<p>Create your first category to start saving links.</p>';
    return;
  }

  categories.forEach((category) => {
    const card = document.createElement('article');
    card.className = 'category';

    const linksHtml = category.links.length
      ? `<ul>${category.links
          .map(
            (link) => `
            <li class="link-row">
              <a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.name}</a>
              <div class="controls">
                <button data-action="edit" data-link-id="${link.id}" data-category-id="${category.id}" class="ghost">Edit</button>
                <button data-action="delete-link" data-link-id="${link.id}" class="danger">Delete</button>
              </div>
            </li>`
          )
          .join('')}</ul>`
      : '<p>No links yet.</p>';

    card.innerHTML = `
      <div class="category-head">
        <h3>${category.name}</h3>
        <button data-action="delete-category" data-category-id="${category.id}" class="danger">Delete</button>
      </div>
      ${linksHtml}
    `;

    dashboard.append(card);
  });
};

const loadData = async () => {
  categories = await fetchJSON('/api/dashboard');
  render();
};

categoryForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    await fetchJSON('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name: categoryNameInput.value }),
    });
    categoryForm.reset();
    await loadData();
    showMessage('Category added.');
  } catch (error) {
    showMessage(error.message, true);
  }
});

linkForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    name: linkNameInput.value,
    url: linkUrlInput.value,
    category_id: Number(linkCategorySelect.value),
  };

  try {
    if (editingLinkId) {
      await fetchJSON(`/api/links/${editingLinkId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      showMessage('Link updated.');
    } else {
      await fetchJSON('/api/links', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      showMessage('Link added.');
    }

    resetLinkForm();
    await loadData();
  } catch (error) {
    showMessage(error.message, true);
  }
});

cancelEditBtn.addEventListener('click', () => {
  resetLinkForm();
  showMessage('Edit canceled.');
});

dashboard.addEventListener('click', async (event) => {
  const btn = event.target.closest('button[data-action]');
  if (!btn) return;

  const action = btn.dataset.action;

  try {
    if (action === 'delete-category') {
      await fetchJSON(`/api/categories/${btn.dataset.categoryId}`, { method: 'DELETE' });
      showMessage('Category deleted.');
    }

    if (action === 'delete-link') {
      await fetchJSON(`/api/links/${btn.dataset.linkId}`, { method: 'DELETE' });
      showMessage('Link deleted.');
    }

    if (action === 'edit') {
      const category = categories.find((cat) => String(cat.id) === btn.dataset.categoryId);
      const link = category?.links.find((entry) => String(entry.id) === btn.dataset.linkId);
      if (!link) throw new Error('Link not found.');
      startEdit(link, btn.dataset.categoryId);
      return;
    }

    await loadData();
    if (editingLinkId && action !== 'edit') resetLinkForm();
  } catch (error) {
    showMessage(error.message, true);
  }
});

loadData().catch((error) => showMessage(error.message, true));
