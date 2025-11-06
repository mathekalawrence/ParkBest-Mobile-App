const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// Create reports table if not exists
const createReportsTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        type VARCHAR(50) NOT NULL,
        event VARCHAR(100) NOT NULL,
        data JSONB,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
  } catch (error) {
    console.error('Error creating reports table:', error);
  }
};

createReportsTable();

// Log authentication events
router.post('/auth', auth, async (req, res) => {
  try {
    const { type, event, data } = req.body;
    
    await db.query(
      'INSERT INTO reports (user_id, type, event, data) VALUES ($1, $2, $3, $4)',
      [req.user.userId, type, event, data]
    );

    res.json({ message: 'Auth event logged successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log auth event' });
  }
});

// Log parking events
router.post('/parking', auth, async (req, res) => {
  try {
    const { type, event, data } = req.body;
    
    await db.query(
      'INSERT INTO reports (user_id, type, event, data) VALUES ($1, $2, $3, $4)',
      [req.user.userId, type, event, data]
    );

    res.json({ message: 'Parking event logged successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log parking event' });
  }
});

// Get user reports
router.get('/user', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM reports WHERE user_id = $1 ORDER BY timestamp DESC',
      [req.user.userId]
    );

    res.json({ reports: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get system summary (admin only)
router.get('/summary', auth, async (req, res) => {
  try {
    const authEvents = await db.query(
      "SELECT COUNT(*) as total, COUNT(CASE WHEN data->>'success' = 'true' THEN 1 END) as successful FROM reports WHERE type = 'AUTH'"
    );
    
    const parkingEvents = await db.query(
      "SELECT COUNT(*) as total FROM reports WHERE type = 'PARKING'"
    );

    const integrationEvents = await db.query(
      "SELECT COUNT(*) as total FROM reports WHERE type = 'INTEGRATION'"
    );

    res.json({
      authEvents: authEvents.rows[0],
      parkingEvents: parkingEvents.rows[0],
      integrationEvents: integrationEvents.rows[0],
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

module.exports = router;