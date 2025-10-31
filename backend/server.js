const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Update with your MySQL password
  database: 'TournamentDB2'
});

// Test connection
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    console.log('Starting server anyway...');
  } else {
    console.log('Connected to MySQL database');
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// API Routes
app.get('/api/players', (req, res) => {
  db.query('SELECT * FROM Player', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/players', (req, res) => {
  const { name, username, bdate, points } = req.body;
  const generatedUsername = username || name.toLowerCase().replace(/\s+/g, '');
  const query = 'INSERT INTO Player (Username, Name, Bdate, Points) VALUES (?, ?, ?, ?)';
  db.query(query, [generatedUsername, name, bdate || null, points || 0], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ Username: generatedUsername, Name: name, Points: points || 0 });
  });
});

app.delete('/api/players/:username', (req, res) => {
  const { username } = req.params;
  const query = 'DELETE FROM Player WHERE Username = ?';
  db.query(query, [username], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Player deleted successfully' });
  });
});

app.get('/api/teams', (req, res) => {
  db.query('SELECT * FROM Team', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get('/api/games', (req, res) => {
  db.query('SELECT * FROM Game', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});