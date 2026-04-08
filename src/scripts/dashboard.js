let categories = [];
let editingLinkId = null;

document.addEventListener('DOMContentLoaded', () => {
  const categoryForm = document.getElementById('category-form');
  const categoryNameInput = document.getElementById('category-name');
  const linkForm = document.getElementById('link-form');
  const linkNameInput = document.getElementById('link-name');
  const linkUrlInput = document.getElementById('link-url');
  const linkCategorySelect = document.getElementById('link-category');
  const formTitle = document.getElementById('form-title');
  const saveButton = document.getElementById('save-button');
  const cancelEditButton = document.getElementById('cancel-edit');
  const messageElement = document.getElementById('message');
  const dashboardElement = document.getElementById('dashboard');

  function showMessage(text, isError = false) {
    messageElement.textContent = text;
    messageElement.style.color = isError ? '#b91c1c' : '#6b7280';
  }

  async function requestJSON(url, options = {}) {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  function setEditMode(link, categoryId) {
    editingLinkId = link.id;
    formTitle.textContent = 'Edit Link';
    saveButton.textContent = 'Update Link';
    cancelEditButton.hidden = false;
    linkNameInput.value = link.name;
    linkUrlInput.value = link.url;
    linkCategorySelect.value = String(categoryId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    editingLinkId = null;
    formTitle.textContent = 'Add Link';
    saveButton.textContent = 'Save Link';
    cancelEditButton.hidden = true;
    linkForm.reset();
    if (categories.length) {
      linkCategorySelect.value = String(categories[0].id);
    }
  }

  function renderCategoryOptions() {
    linkCategorySelect.innerHTML = '';

    for (const category of categories) {
      const option = document.createElement('option');
      option.value = String(category.id);
      option.textContent = category.name;
      linkCategorySelect.append(option);
    }
  }

  function renderDashboard() {
    dashboardElement.innerHTML = '';

    if (!categories.length) {
      const emptyText = document.createElement('p');
      emptyText.className = 'empty';
      emptyText.textContent = 'Create your first category to start saving links.';
      dashboardElement.append(emptyText);
      return;
    }

    for (const category of categories) {
      const card = document.createElement('article');
      card.className = 'category-card';

      const head = document.createElement('div');
      head.className = 'category-head';

      const title = document.createElement('h3');
      title.textContent = category.name;

      const deleteCategoryButton = document.createElement('button');
      deleteCategoryButton.type = 'button';
      deleteCategoryButton.className = 'danger';
      deleteCategoryButton.textContent = 'Delete';
      deleteCategoryButton.addEventListener('click', async () => {
        try {
          await requestJSON(`/api/categories/${category.id}`, { method: 'DELETE' });
          await refreshData();
          showMessage('Category deleted.');
        } catch (error) {
          showMessage(error.message, true);
        }
      });

      head.append(title, deleteCategoryButton);
      card.append(head);

      if (!category.links.length) {
        const empty = document.createElement('p');
        empty.className = 'empty';
        empty.textContent = 'No links yet.';
        card.append(empty);
      } else {
        const list = document.createElement('ul');
        list.className = 'links';

        for (const link of category.links) {
          const row = document.createElement('li');
          row.className = 'link-row';

          const anchor = document.createElement('a');
          anchor.href = link.url;
          anchor.target = '_blank';
          anchor.rel = 'noopener noreferrer';
          anchor.textContent = link.name;

          const actions = document.createElement('div');
          actions.className = 'row-actions';

          const editButton = document.createElement('button');
          editButton.type = 'button';
          editButton.className = 'ghost';
          editButton.textContent = 'Edit';
          editButton.addEventListener('click', () => setEditMode(link, category.id));

          const deleteButton = document.createElement('button');
          deleteButton.type = 'button';
          deleteButton.className = 'danger';
          deleteButton.textContent = 'Delete';
          deleteButton.addEventListener('click', async () => {
            try {
              await requestJSON(`/api/links/${link.id}`, { method: 'DELETE' });
              await refreshData();
              showMessage('Link deleted.');
              if (editingLinkId === link.id) {
                resetForm();
              }
            } catch (error) {
              showMessage(error.message, true);
            }
          });

          actions.append(editButton, deleteButton);
          row.append(anchor, actions);
          list.append(row);
        }

        card.append(list);
      }

      dashboardElement.append(card);
    }
  }

  async function refreshData() {
    categories = await requestJSON('/api/dashboard.json');
    renderCategoryOptions();
    renderDashboard();

    if (!categories.length) {
      linkCategorySelect.innerHTML = '';
    }
  }

  categoryForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      await requestJSON('/api/categories', {
        method: 'POST',
        body: JSON.stringify({ name: categoryNameInput.value.trim() })
      });

      categoryForm.reset();
      await refreshData();
      if (categories.length && !editingLinkId) {
        linkCategorySelect.value = String(categories[0].id);
      }
      showMessage('Category added.');
    } catch (error) {
      showMessage(error.message, true);
    }
  });

  linkForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      name: linkNameInput.value.trim(),
      url: linkUrlInput.value.trim(),
      category_id: Number(linkCategorySelect.value)
    };

    try {
      const isEdit = Boolean(editingLinkId);
      if (isEdit) {
        await requestJSON(`/api/links/${editingLinkId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await requestJSON('/api/links', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      resetForm();
      await refreshData();
      showMessage(isEdit ? 'Link updated.' : 'Link added.');
    } catch (error) {
      showMessage(error.message, true);
    }
  });

  cancelEditButton.addEventListener('click', () => {
    resetForm();
    showMessage('Edit canceled.');
  });

  refreshData().catch((error) => {
    showMessage(error.message, true);
  });
});
