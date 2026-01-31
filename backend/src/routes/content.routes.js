/**
 * Content/Pages Routes
 * CRUD operations for pages
 */

const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');
const { authenticate, editorOrAdmin } = require('../middleware/auth');
const { validate, rules } = require('../middleware/validate');

// GET /api/v1/content/pages
router.get('/pages', rules.pagination, rules.language, validate, contentController.getAllPages);

// GET /api/v1/content/pages/hierarchy
router.get('/pages/hierarchy', rules.language, validate, contentController.getPageHierarchy);

// GET /api/v1/content/pages/:slug
router.get('/pages/:slug', rules.slugParam, rules.language, validate, contentController.getPageBySlug);

// POST /api/v1/content/pages (admin/editor only)
router.post('/pages', authenticate, editorOrAdmin, rules.pageCreate, validate, contentController.createPage);

// PUT /api/v1/content/pages/:id (admin/editor only)
router.put('/pages/:id', authenticate, editorOrAdmin, rules.idParam, validate, contentController.updatePage);

// DELETE /api/v1/content/pages/:id (admin/editor only)
router.delete('/pages/:id', authenticate, editorOrAdmin, rules.idParam, validate, contentController.deletePage);

module.exports = router;
