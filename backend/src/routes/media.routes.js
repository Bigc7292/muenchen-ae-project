/**
 * Media Routes
 * File upload and management
 */

const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/media.controller');
const { authenticate, editorOrAdmin } = require('../middleware/auth');
const { validate, rules } = require('../middleware/validate');

// GET /api/v1/media/:id
router.get('/:id', rules.idParam, validate, mediaController.getMedia);

// POST /api/v1/media/upload (admin/editor only)
router.post('/upload', authenticate, editorOrAdmin, mediaController.uploadMedia);

// DELETE /api/v1/media/:id (admin/editor only)
router.delete('/:id', authenticate, editorOrAdmin, rules.idParam, validate, mediaController.deleteMedia);

// GET /api/v1/media (admin/editor only - list all media)
router.get('/', authenticate, editorOrAdmin, rules.pagination, validate, mediaController.listMedia);

module.exports = router;
