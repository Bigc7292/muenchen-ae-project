/**
 * Search Controller
 * Full-text search across content types
 */

const db = require('../utils/db');
const cache = require('../utils/cache');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Global search
 */
exports.search = asyncHandler(async (req, res) => {
  const { query, type = 'all', page = 1, limit = 20, lang } = req.query;
  const language = lang || req.language;
  const offset = (page - 1) * limit;
  const searchTerm = `%${query}%`;

  const results = {
    pages: [],
    events: [],
    news: [],
    business: [],
    locations: []
  };

  // Search pages
  if (type === 'all' || type === 'pages') {
    results.pages = await db('pages')
      .select('pages.id', 'pages.slug', 'page_translations.title', 'page_translations.description')
      .leftJoin('page_translations', function() {
        this.on('pages.id', '=', 'page_translations.page_id')
          .andOn('page_translations.language', '=', db.raw('?', [language]));
      })
      .where('pages.status', 'published')
      .where(function() {
        this.where('page_translations.title', 'ilike', searchTerm)
          .orWhere('page_translations.description', 'ilike', searchTerm)
          .orWhere('page_translations.content', 'ilike', searchTerm);
      })
      .limit(type === 'pages' ? limit : 5);
  }

  // Search events
  if (type === 'all' || type === 'events') {
    results.events = await db('events')
      .select('events.id', 'events.start_date', 'event_translations.title', 'event_translations.description')
      .leftJoin('event_translations', function() {
        this.on('events.id', '=', 'event_translations.event_id')
          .andOn('event_translations.language', '=', db.raw('?', [language]));
      })
      .where('events.status', 'published')
      .where('events.start_date', '>=', new Date())
      .where(function() {
        this.where('event_translations.title', 'ilike', searchTerm)
          .orWhere('event_translations.description', 'ilike', searchTerm);
      })
      .limit(type === 'events' ? limit : 5);
  }

  // Search news
  if (type === 'all' || type === 'news') {
    results.news = await db('news')
      .select('news.id', 'news.slug', 'news.published_at', 'news_translations.title', 'news_translations.excerpt')
      .leftJoin('news_translations', function() {
        this.on('news.id', '=', 'news_translations.news_id')
          .andOn('news_translations.language', '=', db.raw('?', [language]));
      })
      .where('news.status', 'published')
      .where(function() {
        this.where('news_translations.title', 'ilike', searchTerm)
          .orWhere('news_translations.excerpt', 'ilike', searchTerm)
          .orWhere('news_translations.content', 'ilike', searchTerm);
      })
      .orderBy('news.published_at', 'desc')
      .limit(type === 'news' ? limit : 5);
  }

  // Search businesses
  if (type === 'all' || type === 'business') {
    results.business = await db('businesses')
      .select('businesses.id', 'businesses.address', 'business_translations.name', 'business_translations.description')
      .leftJoin('business_translations', function() {
        this.on('businesses.id', '=', 'business_translations.business_id')
          .andOn('business_translations.language', '=', db.raw('?', [language]));
      })
      .where('businesses.status', 'active')
      .where(function() {
        this.where('business_translations.name', 'ilike', searchTerm)
          .orWhere('business_translations.description', 'ilike', searchTerm)
          .orWhere('business_translations.services', 'ilike', searchTerm);
      })
      .limit(type === 'business' ? limit : 5);
  }

  // Search POIs
  if (type === 'all' || type === 'locations') {
    results.locations = await db('points_of_interest')
      .select('points_of_interest.id', 'poi_translations.name', 'poi_translations.description')
      .leftJoin('poi_translations', function() {
        this.on('points_of_interest.id', '=', 'poi_translations.poi_id')
          .andOn('poi_translations.language', '=', db.raw('?', [language]));
      })
      .where('points_of_interest.status', 'published')
      .where(function() {
        this.where('poi_translations.name', 'ilike', searchTerm)
          .orWhere('poi_translations.description', 'ilike', searchTerm);
      })
      .limit(type === 'locations' ? limit : 5);
  }

  res.json({
    query,
    data: type === 'all' ? results : results[type],
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit)
    }
  });
});

/**
 * Search suggestions (autocomplete)
 */
exports.getSuggestions = asyncHandler(async (req, res) => {
  const { query, lang } = req.query;
  const language = lang || req.language;

  if (!query || query.length < 2) {
    return res.json({ data: [] });
  }

  const searchTerm = `${query}%`;

  // Get suggestions from page titles
  const suggestions = await db('page_translations')
    .select('title as suggestion')
    .where('language', language)
    .where('title', 'ilike', searchTerm)
    .limit(10);

  res.json({ data: suggestions.map(s => s.suggestion) });
});
