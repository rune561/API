require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 👇 1. TELL EXPRESS TO SERVE YOUR CUSTOM FOLDER 👇
app.use(express.static(path.join(__dirname, 'froentend')));

// 👇 2. DATABASE CONNECTION (With safety checks) 👇
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10
});

// --- API ROUTES ---
app.get('/tasks', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/tasks', async (req, res) => {
  try {
    const { title } = req.body;
    const [result] = await pool.query('INSERT INTO tasks (title) VALUES (?)', [title]);
    res.status(201).json({ id: result.insertId, title: title });
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/tasks/:id', async (req, res) => {
  try {
    const { completed } = req.body;
    await pool.query('UPDATE tasks SET completed = ? WHERE id = ?', [completed, req.params.id]);
    res.json({ message: 'Updated' });
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 👇 3. FALLBACK: Loads your custom index.html if the browser asks for it 👇
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'froentend', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Open http://localhost:${PORT} in your browser`);
  console.log(`=================================`);
});