/**
 * News Routes
 * CRUD operations for news articles
 */

const express = require('express');
const router = express.Router();
const newsController = require('../controllers/news.controller');
const { authenticate, editorOrAdmin } = require('../middleware/auth');
const { validate, rules } = require('../middleware/validate');

// GET /api/v1/news
router.get('/', rules.pagination, rules.language, validate, newsController.getAllNews);

// GET /api/v1/news/latest
router.get('/latest', rules.language, validate, newsController.getLatestNews);

// GET /api/v1/news/categories
router.get('/categories', newsController.getCategories);

// GET /api/v1/news/:id
router.get('/:id', rules.idParam, rules.language, validate, newsController.getNewsById);

// GET /api/v1/news/slug/:slug
router.get('/slug/:slug', rules.slugParam, rules.language, validate, newsController.getNewsBySlug);

// POST /api/v1/news (admin/editor only)
router.post('/', authenticate, editorOrAdmin, rules.newsCreate, validate, newsController.createNews);

// PUT /api/v1/news/:id (admin/editor only)
router.put('/:id', authenticate, editorOrAdmin, rules.idParam, validate, newsController.updateNews);

// DELETE /api/v1/news/:id (admin/editor only)
router.delete('/:id', authenticate, editorOrAdmin, rules.idParam, validate, newsController.deleteNews);

module.exports = router;
