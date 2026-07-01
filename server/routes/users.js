const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('./auth');

// Get all users
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new user
router.post('/', authenticateToken, async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Apenas superadmins podem criar usuários' });
  }
  
  const { email, password, role } = req.body;
  
  if (!email || !password || !role) {
    return res.status(400).json({ error: 'E-mail, senha e nível de acesso são obrigatórios' });
  }

  try {
    const bcrypt = require('bcrypt');
    const crypto = require('crypto');
    
    // Check if email already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Este e-mail já está em uso' });
    }

    const id = crypto.randomUUID();
    const hash = await bcrypt.hash(password, 10);
    
    await db.query(
      'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [id, email, hash, role]
    );
    
    res.status(201).json({ id, email, role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user role
router.put('/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Apenas superadmins podem alterar papéis' });
  }
  
  const { role } = req.body;
  try {
    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
