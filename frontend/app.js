// frontend/app.js

async function fetchTasks() {
  try {
    const res = await fetch('http://localhost:3000/api/tasks');
    if (!res.ok) throw new Error(`Server responded with ${res.status}`);
    const tasks = await res.json();

    // --- Update counters ---
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-done').textContent = completed;
    document.getElementById('stat-pending').textContent = pending;
    document.getElementById('list-summary').textContent = `${total} task${total !== 1 ? 's' : ''}`;

    // --- Render task list with buttons ---
    const list = document.getElementById('task-list');
    list.innerHTML = tasks.map(t =>
      `<li data-id="${t.id}">
        <span>${t.title}</span>
        <button class="btn-done">${t.completed ? 'Undo' : 'Done'}</button>
        <button class="btn-edit">Edit</button>
        <button class="btn-delete">Delete</button>
      </li>`
    ).join('');

    // Attach event listeners
    document.querySelectorAll('.btn-done').forEach(btn =>
      btn.addEventListener('click', toggleTask)
    );
    document.querySelectorAll('.btn-edit').forEach(btn =>
      btn.addEventListener('click', editTask)
    );
    document.querySelectorAll('.btn-delete').forEach(btn =>
      btn.addEventListener('click', deleteTask)
    );

  } catch (err) {
    console.error('Error fetching tasks:', err);
    document.getElementById('task-list').innerHTML =
      '<li style="color:red">Couldn’t load tasks</li>';
  }
}

async function addTask(title) {
  try {
    const res = await fetch('http://localhost:3000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, completed: false })
    });
    if (!res.ok) throw new Error(`Server responded with ${res.status}`);
    await res.json();
    fetchTasks();
  } catch (err) {
    console.error('Error adding task:', err);
  }
}

async function toggleTask(e) {
  const id = e.target.closest('li').dataset.id;
  const current = e.target.textContent === 'Undo'; // if Undo, mark false
  try {
    await fetch(`http://localhost:3000/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !current })
    });
    fetchTasks();
  } catch (err) {
    console.error('Error toggling task:', err);
  }
}

async function editTask(e) {
  const li = e.target.closest('li');
  const id = li.dataset.id;
  const currentTitle = li.querySelector('span').textContent;
  const newTitle = prompt('Edit task title:', currentTitle);
  if (!newTitle || !newTitle.trim()) return;
  try {
    await fetch(`http://localhost:3000/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.trim() })
    });
    fetchTasks();
  } catch (err) {
    console.error('Error editing task:', err);
  }
}

async function deleteTask(e) {
  const id = e.target.closest('li').dataset.id;
  if (!confirm('Delete this task?')) return;
  try {
    await fetch(`http://localhost:3000/api/tasks/${id}`, { method: 'DELETE' });
    fetchTasks();
  } catch (err) {
    console.error('Error deleting task:', err);
  }
}

// --- Hook up form ---
document.getElementById('task-form').addEventListener('submit', e => {
  e.preventDefault();
  const input = document.getElementById('task-input');
  if (input.value.trim()) {
    addTask(input.value.trim());
    input.value = '';
  }
});

// --- Load tasks on page ready ---
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('today-date').textContent =
    new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  fetchTasks();
});
