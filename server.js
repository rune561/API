// server.js — entry point
// Flow: request → route → validation → MySQL → response
// (Simplified version: No separate controllers or models)

require('dotenv').config();

const express = require('express');
const pool = require('./src/db'); // Import the connection pool

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 1. Health check
app.get('/', (req, res) => {
  res.json({ message: 'Task API is ready!', version: 'Simplified Edition' });
});

// 2. GET /tasks (Get all tasks)
app.get('/tasks', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// 3. POST /tasks (Create a task)
app.post('/tasks', async (req, res, next) => {
  try {
    const { title, completed } = req.body;

    // Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Insert into DB using parameterized queries (prevents SQL injection)
    const [result] = await pool.query(
      'INSERT INTO tasks (title, completed) VALUES (?, ?)',
      [title.trim(), completed ?? false]
    );
    
    // Fetch the newly created task to return it
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);

  } catch (err) {
    next(err);
  }
});

// 4. GET /tasks/:id (Get one task)
app.get('/tasks/:id', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);

    if (!rows[0]) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// 5. PUT /tasks/:id (Full update)
app.put('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'completed must be true or false' });
    }

    const [result] = await pool.query(
      'UPDATE tasks SET title = ?, completed = ? WHERE id = ?',
      [title.trim(), completed, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// 6. PATCH /tasks/:id (Partial update)
app.patch('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    if (title === undefined && completed === undefined) {
      return res.status(400).json({ error: 'Provide title or completed to update' });
    }

    const updates = [];
    const values = [];

    if (title !== undefined) {
      if (title.trim() === '') return res.status(400).json({ error: 'Title cannot be empty' });
      updates.push('title = ?');
      values.push(title.trim());
    }
    
    if (completed !== undefined) {
      if (typeof completed !== 'boolean') return res.status(400).json({ error: 'completed must be true or false' });
      updates.push('completed = ?');
      values.push(completed);
    }

    values.push(id); // Add ID to the end for the WHERE clause

    const [result] = await pool.query(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// 7. DELETE /tasks/:id
app.delete('/tasks/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Global Error Handler (Exact same as Sir's)
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('GET    /');
  console.log('GET    /tasks');
  console.log('POST   /tasks');
  console.log('GET    /tasks/:id');
  console.log('PUT    /tasks/:id');
  console.log('PATCH  /tasks/:id');
  console.log('DELETE /tasks/:id');
});