/**
 * Events Controller
 * Handles event/veranstaltungen operations
 */

const { Event } = require('../models');
const cache = require('../utils/cache');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

/**
 * Get all events
 */
exports.getAllEvents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, lang, category, startDate, endDate, featured } = req.query;
  const language = lang || req.language;

  const events = await Event.findAll({
    page,
    limit,
    language,
    category,
    startDate,
    endDate,
    featured: featured === 'true' ? true : featured === 'false' ? false : null
  });

  res.json({
    data: events,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit)
    }
  });
});

/**
 * Get upcoming events
 */
exports.getUpcomingEvents = asyncHandler(async (req, res) => {
  const { lang, limit = 10 } = req.query;
  const language = lang || req.language;

  const cacheKey = `events:upcoming:${language}:${limit}`;
  
  const events = await cache.getOrSet(cacheKey, async () => {
    return Event.getUpcoming(language, parseInt(limit));
  }, 300);

  res.json({ data: events });
});

/**
 * Get events by date
 */
exports.getEventsByDate = asyncHandler(async (req, res) => {
  const { date } = req.params;
  const language = req.query.lang || req.language;

  const events = await Event.getByDate(date, language);

  res.json({ data: events });
});

/**
 * Get event categories
 */
exports.getCategories = asyncHandler(async (req, res) => {
  const cacheKey = 'events:categories';
  
  const categories = await cache.getOrSet(cacheKey, async () => {
    return Event.getCategories();
  }, 3600);

  res.json({ data: categories });
});

/**
 * Get event by ID
 */
exports.getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const language = req.query.lang || req.language;

  const event = await Event.findById(id, language);

  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  res.json({ data: event });
});

/**
 * Create event (admin/editor)
 */
exports.createEvent = asyncHandler(async (req, res) => {
  const eventData = req.body;
  eventData.createdBy = req.user.id;

  const event = await Event.create(eventData, eventData.translations);

  await cache.clearPattern('events:*');

  res.status(201).json({
    message: 'Event created',
    data: event
  });
});

/**
 * Update event (admin/editor)
 */
exports.updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingEvent = await Event.findById(id);
  if (!existingEvent) {
    throw new ApiError(404, 'Event not found');
  }

  const event = await Event.update(id, req.body, req.body.translations);

  await cache.clearPattern('events:*');

  res.json({
    message: 'Event updated',
    data: event
  });
});

/**
 * Delete event (admin/editor)
 */
exports.deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingEvent = await Event.findById(id);
  if (!existingEvent) {
    throw new ApiError(404, 'Event not found');
  }

  await Event.delete(id);
  await cache.clearPattern('events:*');

  res.json({ message: 'Event deleted' });
});
