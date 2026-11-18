const express = require('express');
const db = require('../db');
const asyncHandler = require('../middleware/async.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const { validateBody, validateParams } = require('../middleware/validate.middleware');
const { noteSchema, noteIdParamSchema } = require('../validators/note.validator');

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const result = await db.query(
      'SELECT id, user_id, title, content, created_at, updated_at FROM notes WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    );

    return res.status(200).json(result.rows);
  })
);

router.post(
  '/',
  validateBody(noteSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { title, content } = req.body;

    const result = await db.query(
      'INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3) RETURNING id, user_id, title, content, created_at, updated_at',
      [userId, title, content]
    );

    return res.status(201).json(result.rows[0]);
  })
);

router.get(
  '/:id',
  validateParams(noteIdParamSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await db.query(
      'SELECT id, user_id, title, content, created_at, updated_at FROM notes WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    return res.status(200).json(result.rows[0]);
  })
);

router.put(
  '/:id',
  validateParams(noteIdParamSchema),
  validateBody(noteSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, content } = req.body;

    const result = await db.query(
      'UPDATE notes SET title = $1, content = $2, updated_at = NOW() WHERE id = $3 AND user_id = $4 RETURNING id, user_id, title, content, created_at, updated_at',
      [title, content, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    return res.status(200).json(result.rows[0]);
  })
);

router.delete(
  '/:id',
  validateParams(noteIdParamSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    return res.status(200).json({ message: 'Note deleted successfully' });
  })
);

module.exports = router;
