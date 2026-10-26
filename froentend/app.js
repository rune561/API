// The URL of your backend API
const API_URL = 'http://localhost:3000/tasks';

// Get DOM elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

// 1. Fetch and display tasks when the page loads
document.addEventListener('DOMContentLoaded', fetchTasks);

async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        const tasks = await response.json();
        
        taskList.innerHTML = ''; // Clear the list before rendering
        
        tasks.forEach(task => {
            renderTask(task);
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

// 2. Add a new task
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent page reload
    
    const title = taskInput.value.trim();
    if (!title) return;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title })
        });

        if (response.ok) {
            taskInput.value = ''; // Clear input
            fetchTasks(); // Refresh the list
        }
    } catch (error) {
        console.error('Error creating task:', error);
    }
});

// 3. Render a single task in the HTML
function renderTask(task) {
    const li = document.createElement('li');
    if (task.completed) {
        li.classList.add('completed');
    }

    // Task title
    const span = document.createElement('span');
    span.textContent = task.title;

    // Actions container
    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('actions');

    // Toggle button (Complete/Undo)
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = task.completed ? 'Undo' : 'Complete';
    toggleBtn.classList.add('btn-toggle');
    toggleBtn.onclick = () => toggleTask(task.id, task.completed);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.classList.add('btn-delete');
    deleteBtn.onclick = () => deleteTask(task.id);

    // Assemble the elements
    actionsDiv.appendChild(toggleBtn);
    actionsDiv.appendChild(deleteBtn);
    li.appendChild(span);
    li.appendChild(actionsDiv);

    taskList.appendChild(li);
}

// 4. Toggle task completion (PATCH request)
async function toggleTask(id, currentStatus) {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed: !currentStatus })
        });
        fetchTasks(); // Refresh list
    } catch (error) {
        console.error('Error updating task:', error);
    }
}

// 5. Delete a task (DELETE request)
async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        fetchTasks(); // Refresh list
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}