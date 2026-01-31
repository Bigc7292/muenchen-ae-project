/**
 * News Controller
 * Handles news article operations
 */

const { News } = require('../models');
const cache = require('../utils/cache');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

/**
 * Get all news
 */
exports.getAllNews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, lang, category, featured } = req.query;
  const language = lang || req.language;

  const news = await News.findAll({
    page,
    limit,
    language,
    category,
    featured: featured === 'true' ? true : featured === 'false' ? false : null
  });

  res.json({
    data: news,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit)
    }
  });
});

/**
 * Get latest news
 */
exports.getLatestNews = asyncHandler(async (req, res) => {
  const { lang, limit = 5 } = req.query;
  const language = lang || req.language;

  const cacheKey = `news:latest:${language}:${limit}`;
  
  const news = await cache.getOrSet(cacheKey, async () => {
    return News.getLatest(language, parseInt(limit));
  }, 300);

  res.json({ data: news });
});

/**
 * Get news categories
 */
exports.getCategories = asyncHandler(async (req, res) => {
  const cacheKey = 'news:categories';
  
  const categories = await cache.getOrSet(cacheKey, async () => {
    return News.getCategories();
  }, 3600);

  res.json({ data: categories });
});

/**
 * Get news by ID
 */
exports.getNewsById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const language = req.query.lang || req.language;

  const news = await News.findById(id, language);

  if (!news) {
    throw new ApiError(404, 'News article not found');
  }

  res.json({ data: news });
});

/**
 * Get news by slug
 */
exports.getNewsBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const language = req.query.lang || req.language;

  const news = await News.findBySlug(slug, language);

  if (!news) {
    throw new ApiError(404, 'News article not found');
  }

  res.json({ data: news });
});

/**
 * Create news (admin/editor)
 */
exports.createNews = asyncHandler(async (req, res) => {
  const newsData = req.body;
  newsData.authorId = req.user.id;

  const news = await News.create(newsData, newsData.translations);

  await cache.clearPattern('news:*');

  res.status(201).json({
    message: 'News article created',
    data: news
  });
});

/**
 * Update news (admin/editor)
 */
exports.updateNews = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingNews = await News.findById(id);
  if (!existingNews) {
    throw new ApiError(404, 'News article not found');
  }

  const news = await News.update(id, req.body, req.body.translations);

  await cache.clearPattern('news:*');

  res.json({
    message: 'News article updated',
    data: news
  });
});

/**
 * Delete news (admin/editor)
 */
exports.deleteNews = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingNews = await News.findById(id);
  if (!existingNews) {
    throw new ApiError(404, 'News article not found');
  }

  await News.delete(id);
  await cache.clearPattern('news:*');

  res.json({ message: 'News article deleted' });
});
