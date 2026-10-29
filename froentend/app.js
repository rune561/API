// The URL of your backend API
const API_URL = 'http://localhost:3000/tasks'; 

// Get DOM elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const submitBtn = taskForm.querySelector('button[type="submit"]');
const messageBox = document.getElementById('message-box');

// Header date, e.g. "Apr 25, 2025"
document.getElementById('today-date').textContent = new Date().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
});

// Trash icon used on every delete button
const TRASH_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>';

// Banner: success or error message with a close button
let messageTimer;
function showMessage(text, type = 'success') {
    clearTimeout(messageTimer);
    messageBox.className = type === 'error' ? 'error' : '';
    messageBox.textContent = '';

    const span = document.createElement('span');
    span.textContent = text;

    const close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', 'Dismiss message');
    close.innerHTML = '&times;';
    close.onclick = clearMessage;

    messageBox.append(span, close);
    messageBox.hidden = false;

    if (type === 'success') messageTimer = setTimeout(clearMessage, 3000);
}

function clearMessage() {
    messageBox.hidden = true;
    messageBox.textContent = '';
}

// Update the three stat cards and the list summary
function updateStats(tasks) {
    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const pending = total - done;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-done').textContent = done;
    document.getElementById('stat-pending').textContent = pending;
    document.getElementById('list-summary').textContent =
        `${total} ${total === 1 ? 'task' : 'tasks'} \u2022 ${done} completed \u2022 ${pending} pending`;
}

// 1. Fetch and display tasks when the page loads
document.addEventListener('DOMContentLoaded', fetchTasks);

async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Server responded with ${response.status}`);
        const tasks = await response.json();

        taskList.innerHTML = ''; // Clear the list before rendering
        tasks.forEach(task => renderTask(task));
        updateStats(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        showMessage('Couldn\u2019t load your tasks. Check that the server is running.', 'error');
    }
}

// 2. Add a new task
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent page reload

    const title = taskInput.value.trim();
    if (!title) return;

    submitBtn.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        });

        if (response.ok) {
            taskInput.value = ''; // Clear input
            await fetchTasks(); // Refresh the list
            showMessage('Task added successfully!');
            taskInput.focus();
        } else {
            showMessage('Couldn\u2019t add that task. Try again.', 'error');
        }
    } catch (error) {
        console.error('Error creating task:', error);
        showMessage('Couldn\u2019t reach the server. Your task wasn\u2019t added.', 'error');
    } finally {
        submitBtn.disabled = false;
    }
});

// 3. Render a single task in the HTML
function renderTask(task) {
    const li = document.createElement('li');
    if (task.completed) li.classList.add('completed');

    // Checkbox (toggles completion)
    const check = document.createElement('input');
    check.type = 'checkbox';
    check.className = 'check';
    check.checked = !!task.completed;
    check.setAttribute('aria-label', `Mark "${task.title}" as ${task.completed ? 'pending' : 'completed'}`);
    check.onchange = () => toggleTask(task.id, task.completed);

    // Task title
    const title = document.createElement('span');
    title.className = 'task-title';
    title.textContent = task.title;

    // Status badge
    const badge = document.createElement('span');
    badge.className = task.completed ? 'badge badge-done' : 'badge badge-pending';
    badge.textContent = task.completed ? 'Completed' : 'Pending';

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-delete';
    deleteBtn.innerHTML = TRASH_ICON;
    deleteBtn.setAttribute('aria-label', `Delete task: ${task.title}`);
    deleteBtn.onclick = () => deleteTask(task.id);

    li.append(check, title, badge, deleteBtn);
    taskList.appendChild(li);
}

// 4. Toggle task completion (PATCH request)
async function toggleTask(id, currentStatus) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: !currentStatus })
        });
        if (!response.ok) throw new Error(`Server responded with ${response.status}`);
        fetchTasks(); // Refresh list
    } catch (error) {
        console.error('Error updating task:', error);
        showMessage('Couldn\u2019t update that task. Try again.', 'error');
        fetchTasks(); // Reset the checkbox to the real state
    }
}

// 5. Delete a task (DELETE request)
async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(`Server responded with ${response.status}`);
        await fetchTasks();
        showMessage('Task deleted.');
    } catch (error) {
        console.error('Error deleting task:', error);
        showMessage('Couldn\u2019t delete that task. Try again.', 'error');
    }
}