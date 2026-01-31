/**
 * Search Routes
 * Full-text search across content types
 */

const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');
const { validate, rules } = require('../middleware/validate');

// GET /api/v1/search
router.get('/', rules.search, rules.pagination, rules.language, validate, searchController.search);

// GET /api/v1/search/suggestions
router.get('/suggestions', searchController.getSuggestions);

module.exports = router;
