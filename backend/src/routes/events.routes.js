/**
 * Events Routes
 * CRUD operations for events/veranstaltungen
 */

const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/events.controller');
const { authenticate, editorOrAdmin } = require('../middleware/auth');
const { validate, rules } = require('../middleware/validate');

// GET /api/v1/events
router.get('/', rules.pagination, rules.language, validate, eventsController.getAllEvents);

// GET /api/v1/events/upcoming
router.get('/upcoming', rules.language, validate, eventsController.getUpcomingEvents);

// GET /api/v1/events/by-date/:date
router.get('/by-date/:date', rules.language, validate, eventsController.getEventsByDate);

// GET /api/v1/events/categories
router.get('/categories', eventsController.getCategories);

// GET /api/v1/events/:id
router.get('/:id', rules.idParam, rules.language, validate, eventsController.getEventById);

// POST /api/v1/events (admin/editor only)
router.post('/', authenticate, editorOrAdmin, rules.eventCreate, validate, eventsController.createEvent);

// PUT /api/v1/events/:id (admin/editor only)
router.put('/:id', authenticate, editorOrAdmin, rules.idParam, validate, eventsController.updateEvent);

// DELETE /api/v1/events/:id (admin/editor only)
router.delete('/:id', authenticate, editorOrAdmin, rules.idParam, validate, eventsController.deleteEvent);

module.exports = router;
