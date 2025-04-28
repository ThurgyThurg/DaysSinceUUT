require('dotenv').config();
const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: false,
  // Adding these for better SCRAM-SHA-256 compatibility
  client_encoding: 'UTF8',
  application_name: 'uutimer'
});
// Initialize the database table if it doesn't exist
async function initDatabase() {
  try {
    // Create the timer table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS timer (
        id SERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL
      )
    `);
    
    // Check if we have any records
    const result = await pool.query('SELECT COUNT(*) FROM timer');
    
    // If no records, insert the initial timestamp
    if (parseInt(result.rows[0].count) === 0) {
      await pool.query('INSERT INTO timer (id, timestamp) VALUES (1, $1)', [Date.now()]);
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Initialize the database when the server starts
initDatabase();

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());

// API endpoint to get current timestamp
app.get('/api/timer', async (req, res) => {
  try {
    const result = await pool.query('SELECT timestamp FROM timer WHERE id = 1');
    
    if (result.rows.length === 0) {
      // If no record exists, create one
      const now = Date.now();
      await pool.query('INSERT INTO timer (id, timestamp) VALUES (1, $1)', [now]);
      res.json({ timestamp: now });
    } else {
      res.json({ timestamp: parseInt(result.rows[0].timestamp) });
    }
  } catch (error) {
    console.error('Error reading timer data:', error);
    res.status(500).json({ error: 'Failed to read timer data' });
  }
});

// API endpoint to reset timer
app.post('/api/timer', async (req, res) => {
  try {
    const now = Date.now();
    await pool.query('UPDATE timer SET timestamp = $1 WHERE id = 1', [now]);
    res.json({ timestamp: now });
  } catch (error) {
    console.error('Error writing timer data:', error);
    res.status(500).json({ error: 'Failed to write timer data' });
  }
});

// For all other routes, serve the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
