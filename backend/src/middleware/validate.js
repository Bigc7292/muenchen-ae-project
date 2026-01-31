/**
 * Validation Middleware
 * Request validation using express-validator
 */

const { validationResult, body, param, query } = require('express-validator');

/**
 * Validation result handler
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

/**
 * Common validation rules
 */
const rules = {
  // Pagination
  pagination: [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ],

  // Language
  language: [
    query('lang').optional().isIn(['de', 'en', 'fr', 'it', 'es', 'ru', 'ar', 'zh-hans'])
  ],

  // ID parameter
  idParam: [
    param('id').isInt({ min: 1 }).withMessage('Invalid ID')
  ],

  // Slug parameter
  slugParam: [
    param('slug').isSlug().withMessage('Invalid slug format')
  ],

  // User registration
  userRegistration: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').trim().notEmpty().withMessage('First name required'),
    body('lastName').trim().notEmpty().withMessage('Last name required')
  ],

  // User login
  userLogin: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required')
  ],

  // Page creation
  pageCreate: [
    body('translations').isObject().withMessage('Translations required'),
    body('translations.de.title').trim().notEmpty().withMessage('German title required'),
    body('template').optional().isString(),
    body('status').optional().isIn(['draft', 'published', 'archived'])
  ],

  // Event creation
  eventCreate: [
    body('translations').isObject().withMessage('Translations required'),
    body('translations.de.title').trim().notEmpty().withMessage('German title required'),
    body('startDate').isISO8601().withMessage('Valid start date required'),
    body('endDate').optional().isISO8601().withMessage('Valid end date required'),
    body('category').optional().isString()
  ],

  // News creation
  newsCreate: [
    body('translations').isObject().withMessage('Translations required'),
    body('translations.de.title').trim().notEmpty().withMessage('German title required'),
    body('translations.de.content').trim().notEmpty().withMessage('German content required'),
    body('category').optional().isString(),
    body('publishedAt').optional().isISO8601()
  ],

  // Business creation
  businessCreate: [
    body('translations').isObject().withMessage('Translations required'),
    body('translations.de.name').trim().notEmpty().withMessage('German name required'),
    body('categoryId').isInt().withMessage('Category ID required'),
    body('address').trim().notEmpty().withMessage('Address required'),
    body('postalCode').trim().notEmpty().withMessage('Postal code required'),
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('website').optional().isURL().withMessage('Valid URL required')
  ],

  // Search
  search: [
    query('query').trim().notEmpty().withMessage('Search query required'),
    query('type').optional().isIn(['all', 'pages', 'events', 'news', 'business', 'locations'])
  ]
};

module.exports = {
  validate,
  rules,
  body,
  param,
  query
};
