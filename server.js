// server.js — entry point
require('dotenv').config();

const express = require('express');
const path = require('path');
const pool = require('./src/db'); // db.js is inside src

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// --- Serve static frontend files ---
app.use(express.static(path.resolve(__dirname, 'frontend')));

// Root route serves index.html from frontend/
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'frontend', 'index.html'));
});

// --- API ROUTES ---
app.get('/api/tasks', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { next(err); }
});

app.post('/api/tasks', async (req, res, next) => {
  try {
    const { title, completed } = req.body;
    if (!title || title.trim() === '') return res.status(400).json({ error: 'Title is required' });
    const [result] = await pool.query(
      'INSERT INTO tasks (title, completed) VALUES (?, ?)',
      [title.trim(), completed ?? false]
    );
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

app.get('/api/tasks/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Task not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

app.put('/api/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;
    if (!title || title.trim() === '') return res.status(400).json({ error: 'Title is required' });
    if (typeof completed !== 'boolean') return res.status(400).json({ error: 'completed must be true or false' });
    const [result] = await pool.query(
      'UPDATE tasks SET title = ?, completed = ? WHERE id = ?',
      [title.trim(), completed, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

app.patch('/api/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;
    if (title === undefined && completed === undefined) return res.status(400).json({ error: 'Provide title or completed' });

    const updates = [];
    const values = [];
    if (title !== undefined) {
      if (title.trim() === '') return res.status(400).json({ error: 'Title cannot be empty' });
      updates.push('title = ?'); values.push(title.trim());
    }
    if (completed !== undefined) {
      if (typeof completed !== 'boolean') return res.status(400).json({ error: 'completed must be true or false' });
      updates.push('completed = ?'); values.push(completed);
    }
    values.push(id);

    const [result] = await pool.query(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, values);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
});

app.delete('/api/tasks/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });
    res.status(204).send();
  } catch (err) { next(err); }
});

// --- Error handler ---
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/tasks`);
});
