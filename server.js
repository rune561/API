// server.js — entry point
require('dotenv').config();

const express = require('express');
<<<<<<< HEAD
const path = require('path');
const pool = require('./src/db'); // db.js is inside src
=======
const pool = require('./src/db');
>>>>>>> 0a8e93c (update)

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

<<<<<<< HEAD
// --- Serve static frontend files ---
app.use(express.static(path.resolve(__dirname, 'frontend')));

// Root route serves index.html from frontend/
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'frontend', 'index.html'));
});

// --- API ROUTES ---
app.get('/api/tasks', async (req, res, next) => {
=======
// 👇 THIS SERVES THE UI DIRECTLY ON LOCALHOST:3000 👇
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Task Manager</title>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; }
            body { background-color: #f4f7f6; display: flex; justify-content: center; padding-top: 50px; }
            .container { background: white; width: 100%; max-width: 500px; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
            h1 { text-align: center; color: #333; margin-bottom: 20px; }
            form { display: flex; gap: 10px; margin-bottom: 20px; }
            input[type="text"] { flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px; }
            button { padding: 10px 15px; background-color: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
            button:hover { background-color: #218838; }
            ul { list-style: none; }
            li { background: #fdfdfd; border: 1px solid #eee; padding: 15px; margin-bottom: 10px; border-radius: 5px; display: flex; justify-content: space-between; align-items: center; }
            li.completed span { text-decoration: line-through; color: #888; }
            .actions { display: flex; gap: 10px; }
            .btn-delete { background-color: #dc3545; }
            .btn-delete:hover { background-color: #c82333; }
            .btn-toggle { background-color: #007bff; }
            .btn-toggle:hover { background-color: #0056b3; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>My Task List</h1>
            <form id="task-form">
                <input type="text" id="task-input" placeholder="Enter a new task..." required>
                <button type="submit">Add Task</button>
            </form>
            <ul id="task-list"></ul>
        </div>
        <script>
            const API_URL = '/tasks';
            const taskForm = document.getElementById('task-form');
            const taskInput = document.getElementById('task-input');
            const taskList = document.getElementById('task-list');

            document.addEventListener('DOMContentLoaded', fetchTasks);

            async function fetchTasks() {
                try {
                    const response = await fetch(API_URL);
                    const tasks = await response.json();
                    taskList.innerHTML = '';
                    tasks.forEach(task => renderTask(task));
                } catch (error) { console.error(error); }
            }

            taskForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const title = taskInput.value.trim();
                if (!title) return;
                try {
                    const response = await fetch(API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title })
                    });
                    if (response.ok) { taskInput.value = ''; fetchTasks(); }
                } catch (error) { console.error(error); }
            });

            function renderTask(task) {
                const li = document.createElement('li');
                if (task.completed) li.classList.add('completed');
                const span = document.createElement('span');
                span.textContent = task.title;
                const actionsDiv = document.createElement('div');
                actionsDiv.classList.add('actions');
                
                const toggleBtn = document.createElement('button');
                toggleBtn.textContent = task.completed ? 'Undo' : 'Complete';
                toggleBtn.classList.add('btn-toggle');
                toggleBtn.onclick = () => toggleTask(task.id, task.completed);
                
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.classList.add('btn-delete');
                deleteBtn.onclick = () => deleteTask(task.id);
                
                actionsDiv.appendChild(toggleBtn);
                actionsDiv.appendChild(deleteBtn);
                li.appendChild(span);
                li.appendChild(actionsDiv);
                taskList.appendChild(li);
            }

            async function toggleTask(id, currentStatus) {
                try {
                    await fetch(\`\${API_URL}/\${id}\`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ completed: !currentStatus })
                    });
                    fetchTasks();
                } catch (error) { console.error(error); }
            }

            async function deleteTask(id) {
                if (!confirm('Delete this task?')) return;
                try {
                    await fetch(\`\${API_URL}/\${id}\`, { method: 'DELETE' });
                    fetchTasks();
                } catch (error) { console.error(error); }
            }
        </script>
    </body>
    </html>
  `);
});

// --- API ROUTES ---
app.get('/tasks', async (req, res, next) => {
>>>>>>> 0a8e93c (update)
  try {
    const [rows] = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { next(err); }
});

<<<<<<< HEAD
app.post('/api/tasks', async (req, res, next) => {
  try {
    const { title, completed } = req.body;
    if (!title || title.trim() === '') return res.status(400).json({ error: 'Title is required' });
    const [result] = await pool.query(
      'INSERT INTO tasks (title, completed) VALUES (?, ?)',
      [title.trim(), completed ?? false]
    );
=======
app.post('/tasks', async (req, res, next) => {
  try {
    const { title, completed } = req.body;
    if (!title || title.trim() === '') return res.status(400).json({ error: 'Title is required' });
    const [result] = await pool.query('INSERT INTO tasks (title, completed) VALUES (?, ?)', [title.trim(), completed ?? false]);
>>>>>>> 0a8e93c (update)
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

<<<<<<< HEAD
app.get('/api/tasks/:id', async (req, res, next) => {
=======
app.get('/tasks/:id', async (req, res, next) => {
>>>>>>> 0a8e93c (update)
  try {
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Task not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

<<<<<<< HEAD
app.put('/api/tasks/:id', async (req, res, next) => {
=======
app.put('/tasks/:id', async (req, res, next) => {
>>>>>>> 0a8e93c (update)
  try {
    const { id } = req.params;
    const { title, completed } = req.body;
    if (!title || title.trim() === '') return res.status(400).json({ error: 'Title is required' });
    if (typeof completed !== 'boolean') return res.status(400).json({ error: 'completed must be true or false' });
<<<<<<< HEAD
    const [result] = await pool.query(
      'UPDATE tasks SET title = ?, completed = ? WHERE id = ?',
      [title.trim(), completed, id]
    );
=======
    const [result] = await pool.query('UPDATE tasks SET title = ?, completed = ? WHERE id = ?', [title.trim(), completed, id]);
>>>>>>> 0a8e93c (update)
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

<<<<<<< HEAD
app.patch('/api/tasks/:id', async (req, res, next) => {
=======
app.patch('/tasks/:id', async (req, res, next) => {
>>>>>>> 0a8e93c (update)
  try {
    const { id } = req.params;
    const { title, completed } = req.body;
    if (title === undefined && completed === undefined) return res.status(400).json({ error: 'Provide title or completed' });
<<<<<<< HEAD

    const updates = [];
    const values = [];
=======
    const updates = []; const values = [];
>>>>>>> 0a8e93c (update)
    if (title !== undefined) {
      if (title.trim() === '') return res.status(400).json({ error: 'Title cannot be empty' });
      updates.push('title = ?'); values.push(title.trim());
    }
    if (completed !== undefined) {
      if (typeof completed !== 'boolean') return res.status(400).json({ error: 'completed must be true or false' });
      updates.push('completed = ?'); values.push(completed);
    }
    values.push(id);
<<<<<<< HEAD

=======
>>>>>>> 0a8e93c (update)
    const [result] = await pool.query(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, values);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

<<<<<<< HEAD
app.delete('/api/tasks/:id', async (req, res, next) => {
=======
app.delete('/tasks/:id', async (req, res, next) => {
>>>>>>> 0a8e93c (update)
  try {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });
    res.status(204).send();
  } catch (err) { next(err); }
});

<<<<<<< HEAD
// --- Error handler ---
=======
>>>>>>> 0a8e93c (update)
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
<<<<<<< HEAD
  console.log(`API available at http://localhost:${PORT}/api/tasks`);
});
=======
});
>>>>>>> 0a8e93c (update)
