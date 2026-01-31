/**
 * Content Controller
 * Handles page/content operations
 */

const { Page } = require('../models');
const cache = require('../utils/cache');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

/**
 * Get all pages
 */
exports.getAllPages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, lang } = req.query;
  const language = lang || req.language;

  const cacheKey = `pages:list:${language}:${page}:${limit}`;
  
  const pages = await cache.getOrSet(cacheKey, async () => {
    return Page.findAll({ page, limit, language });
  }, 300); // 5 min cache

  res.json({
    data: pages,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit)
    }
  });
});

/**
 * Get page hierarchy (navigation)
 */
exports.getPageHierarchy = asyncHandler(async (req, res) => {
  const language = req.query.lang || req.language;

  const cacheKey = `pages:hierarchy:${language}`;
  
  const hierarchy = await cache.getOrSet(cacheKey, async () => {
    return Page.getHierarchy(language);
  }, 600); // 10 min cache

  res.json({ data: hierarchy });
});

/**
 * Get page by slug
 */
exports.getPageBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const language = req.query.lang || req.language;

  const cacheKey = `pages:slug:${slug}:${language}`;
  
  const page = await cache.getOrSet(cacheKey, async () => {
    return Page.findBySlug(slug, language);
  }, 300);

  if (!page) {
    throw new ApiError(404, 'Page not found');
  }

  res.json({ data: page });
});

/**
 * Create page (admin/editor)
 */
exports.createPage = asyncHandler(async (req, res) => {
  const { slug, template, parentId, status, sortOrder, featuredImage, translations } = req.body;

  const page = await Page.create(
    {
      slug,
      template,
      parentId,
      status,
      sortOrder,
      featuredImage,
      createdBy: req.user.id
    },
    translations
  );

  // Clear cache
  await cache.clearPattern('pages:*');

  res.status(201).json({
    message: 'Page created',
    data: page
  });
});

/**
 * Update page (admin/editor)
 */
exports.updatePage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { slug, template, parentId, status, sortOrder, featuredImage, translations } = req.body;

  const existingPage = await Page.findById(id);
  if (!existingPage) {
    throw new ApiError(404, 'Page not found');
  }

  const page = await Page.update(
    id,
    { slug, template, parentId, status, sortOrder, featuredImage },
    translations
  );

  // Clear cache
  await cache.clearPattern('pages:*');

  res.json({
    message: 'Page updated',
    data: page
  });
});

/**
 * Delete page (admin/editor)
 */
exports.deletePage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingPage = await Page.findById(id);
  if (!existingPage) {
    throw new ApiError(404, 'Page not found');
  }

  await Page.delete(id);

  // Clear cache
  await cache.clearPattern('pages:*');

  res.json({ message: 'Page deleted' });
});
