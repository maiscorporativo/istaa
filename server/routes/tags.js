const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('./auth');
const crypto = require('crypto');

// Get all tags
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [tags] = await db.query('SELECT * FROM tags ORDER BY name');
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create tag
router.post('/', authenticateToken, async (req, res) => {
  const { name, category, color } = req.body;
  const id = crypto.randomUUID();
  const slug = name.toLowerCase().replace(/\s+/g, '-');

  try {
    await db.query(
      'INSERT INTO tags (id, name, slug, category, color) VALUES (?, ?, ?, ?, ?)',
      [id, name, slug, category, color || '#3b82f6']
    );
    res.status(201).json({ id, name, slug, category, color });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
