/**
 * Authentication Routes
 * Login, logout, registration, token refresh
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { validate, rules } = require('../middleware/validate');

// POST /api/v1/auth/register
router.post('/register', rules.userRegistration, validate, authController.register);

// POST /api/v1/auth/login
router.post('/login', rules.userLogin, validate, authController.login);

// POST /api/v1/auth/logout
router.post('/logout', authenticate, authController.logout);

// POST /api/v1/auth/refresh
router.post('/refresh', authController.refreshToken);

// GET /api/v1/auth/me
router.get('/me', authenticate, authController.getCurrentUser);

// PUT /api/v1/auth/me
router.put('/me', authenticate, authController.updateCurrentUser);

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);

// POST /api/v1/auth/reset-password
router.post('/reset-password', authController.resetPassword);

module.exports = router;
