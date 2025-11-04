const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { validate } = require('../models/memeConfig');

// In-memory store for MemeConfig objects
const store = new Map();

// POST /api/config
router.post('/', (req, res) => {
  const cfg = req.body;
  const result = validate(cfg);
  if(!result.valid) return res.status(400).json({ error: result.error });
  const id = uuidv4();
  const item = { id, ...cfg };
  store.set(id, item);
  res.status(201).json(item);
});

// PUT /api/config/:id
router.put('/:id', (req, res) => {
  const id = req.params.id;
  if (!store.has(id)) return res.status(404).json({ error: 'Not found' });
  const cfg = req.body;
  const result = validate(cfg);
  if(!result.valid) return res.status(400).json({ error: result.error });
  const updated = { id, ...cfg };
  store.set(id, updated);
  res.json(updated);
});

// expose store for debugging/testing (not for production)
router._store = store;

module.exports = router;
