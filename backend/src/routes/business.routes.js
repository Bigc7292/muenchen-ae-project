/**
 * Business Directory Routes
 * CRUD operations for business listings (Branchenbuch)
 */

const express = require('express');
const router = express.Router();
const businessController = require('../controllers/business.controller');
const { authenticate, adminOnly } = require('../middleware/auth');
const { validate, rules } = require('../middleware/validate');

// GET /api/v1/business
router.get('/', rules.pagination, rules.language, validate, businessController.getAllBusinesses);

// GET /api/v1/business/search
router.get('/search', rules.search, rules.language, validate, businessController.searchBusinesses);

// GET /api/v1/business/categories
router.get('/categories', rules.language, validate, businessController.getCategories);

// GET /api/v1/business/:id
router.get('/:id', rules.idParam, rules.language, validate, businessController.getBusinessById);

// POST /api/v1/business
router.post('/', authenticate, rules.businessCreate, validate, businessController.createBusiness);

// PUT /api/v1/business/:id
router.put('/:id', authenticate, rules.idParam, validate, businessController.updateBusiness);

// DELETE /api/v1/business/:id (admin only)
router.delete('/:id', authenticate, adminOnly, rules.idParam, validate, businessController.deleteBusiness);

// POST /api/v1/business/:id/verify (admin only)
router.post('/:id/verify', authenticate, adminOnly, rules.idParam, validate, businessController.verifyBusiness);

module.exports = router;
