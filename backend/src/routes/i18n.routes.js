/**
 * Internationalization Routes
 * Language and translation endpoints
 */

const express = require('express');
const router = express.Router();
const i18nController = require('../controllers/i18n.controller');

// GET /api/v1/i18n/languages
router.get('/languages', i18nController.getLanguages);

// GET /api/v1/i18n/translations/:lang
router.get('/translations/:lang', i18nController.getTranslations);

module.exports = router;
