/**
 * Locations Routes
 * Districts, POIs, Accommodations
 */

const express = require('express');
const router = express.Router();
const locationsController = require('../controllers/locations.controller');
const { validate, rules } = require('../middleware/validate');

// ==========================================
// DISTRICTS (Stadtteile)
// ==========================================

// GET /api/v1/locations/districts
router.get('/districts', rules.language, validate, locationsController.getDistricts);

// GET /api/v1/locations/districts/:slug
router.get('/districts/:slug', rules.slugParam, rules.language, validate, locationsController.getDistrictBySlug);

// ==========================================
// POINTS OF INTEREST (Sehenswürdigkeiten)
// ==========================================

// GET /api/v1/locations/pois
router.get('/pois', rules.pagination, rules.language, validate, locationsController.getPOIs);

// GET /api/v1/locations/pois/categories
router.get('/pois/categories', locationsController.getPOICategories);

// GET /api/v1/locations/pois/:id
router.get('/pois/:id', rules.idParam, rules.language, validate, locationsController.getPOIById);

// ==========================================
// ACCOMMODATIONS (Übernachten)
// ==========================================

// GET /api/v1/locations/accommodations
router.get('/accommodations', rules.pagination, rules.language, validate, locationsController.getAccommodations);

// GET /api/v1/locations/accommodations/types
router.get('/accommodations/types', locationsController.getAccommodationTypes);

// GET /api/v1/locations/accommodations/:id
router.get('/accommodations/:id', rules.idParam, rules.language, validate, locationsController.getAccommodationById);

module.exports = router;
