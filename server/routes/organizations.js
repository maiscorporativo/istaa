const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('./auth');
const crypto = require('crypto');

// Get all organizations with contacts and tags
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [orgs] = await db.query('SELECT * FROM organizations ORDER BY name');
    const [contacts] = await db.query('SELECT * FROM contacts');
    const [orgTags] = await db.query(`
      SELECT ot.org_id, t.* 
      FROM organization_tags ot 
      JOIN tags t ON ot.tag_id = t.id
    `);

    // Assemble the payload
    const result = orgs.map(org => {
      return {
        ...org,
        contacts: contacts.filter(c => c.org_id === org.id),
        tags: orgTags.filter(t => t.org_id === org.id)
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create organization
router.post('/', authenticateToken, async (req, res) => {
  const { name, site, status, country, description, logo_url, tags, contacts } = req.body;
  const id = crypto.randomUUID();
  
  try {
    await db.query('START TRANSACTION');
    
    await db.query(
      'INSERT INTO organizations (id, name, site, status, country, description, logo_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, site, status || 'Em análise', country, description, logo_url]
    );

    if (tags && tags.length > 0) {
      const tagValues = tags.map(t => [id, t.id]);
      await db.query('INSERT INTO organization_tags (org_id, tag_id) VALUES ?', [tagValues]);
    }

    if (contacts && contacts.length > 0) {
      const contactValues = contacts.map(c => [crypto.randomUUID(), id, c.name, c.email || null, c.phone || null]);
      await db.query('INSERT INTO contacts (id, org_id, name, email, phone) VALUES ?', [contactValues]);
    }

    await db.query('COMMIT');
    
    res.status(201).json({ id, name, site, status, country, description, logo_url });
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

// Update organization
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, site, status, country, description, logo_url, tags, contacts } = req.body;
  
  try {
    await db.query('START TRANSACTION');
    
    await db.query(
      'UPDATE organizations SET name=?, site=?, status=?, country=?, description=?, logo_url=? WHERE id=?',
      [name, site, status, country, description, logo_url, id]
    );

    // Sync Tags
    if (tags !== undefined) {
      await db.query('DELETE FROM organization_tags WHERE org_id = ?', [id]);
      if (tags.length > 0) {
        const tagValues = tags.map(t => [id, t.id]);
        await db.query('INSERT INTO organization_tags (org_id, tag_id) VALUES ?', [tagValues]);
      }
    }

    // Sync Contacts
    if (contacts !== undefined) {
      await db.query('DELETE FROM contacts WHERE org_id = ?', [id]);
      if (contacts.length > 0) {
        const contactValues = contacts.map(c => [crypto.randomUUID(), id, c.name, c.email || null, c.phone || null]);
        await db.query('INSERT INTO contacts (id, org_id, name, email, phone) VALUES ?', [contactValues]);
      }
    }

    await db.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

// Delete organization
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM organizations WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
