/**
 * Business Controller
 * Handles business directory (Branchenbuch) operations
 */

const { Business } = require('../models');
const cache = require('../utils/cache');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

/**
 * Get all businesses
 */
exports.getAllBusinesses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, lang, categoryId, district, verified } = req.query;
  const language = lang || req.language;

  const businesses = await Business.findAll({
    page,
    limit,
    language,
    categoryId,
    district,
    verified: verified === 'true' ? true : verified === 'false' ? false : null
  });

  res.json({
    data: businesses,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit)
    }
  });
});

/**
 * Search businesses
 */
exports.searchBusinesses = asyncHandler(async (req, res) => {
  const { query, lang, page = 1, limit = 20 } = req.query;
  const language = lang || req.language;

  const businesses = await Business.search(query, language, { page, limit });

  res.json({
    data: businesses,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit)
    }
  });
});

/**
 * Get business categories
 */
exports.getCategories = asyncHandler(async (req, res) => {
  const language = req.query.lang || req.language;
  const cacheKey = `business:categories:${language}`;
  
  const categories = await cache.getOrSet(cacheKey, async () => {
    return Business.getCategories(language);
  }, 3600);

  res.json({ data: categories });
});

/**
 * Get business by ID
 */
exports.getBusinessById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const language = req.query.lang || req.language;

  const business = await Business.findById(id, language);

  if (!business) {
    throw new ApiError(404, 'Business not found');
  }

  res.json({ data: business });
});

/**
 * Create business
 */
exports.createBusiness = asyncHandler(async (req, res) => {
  const businessData = req.body;
  businessData.ownerId = req.user.id;

  const business = await Business.create(businessData, businessData.translations);

  res.status(201).json({
    message: 'Business listing created',
    data: business
  });
});

/**
 * Update business
 */
exports.updateBusiness = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingBusiness = await Business.findById(id);
  if (!existingBusiness) {
    throw new ApiError(404, 'Business not found');
  }

  // Check ownership or admin
  if (existingBusiness.owner_id !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to update this business');
  }

  const business = await Business.update(id, req.body, req.body.translations);

  res.json({
    message: 'Business listing updated',
    data: business
  });
});

/**
 * Delete business (admin only)
 */
exports.deleteBusiness = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingBusiness = await Business.findById(id);
  if (!existingBusiness) {
    throw new ApiError(404, 'Business not found');
  }

  await Business.delete(id);

  res.json({ message: 'Business listing deleted' });
});

/**
 * Verify business (admin only)
 */
exports.verifyBusiness = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingBusiness = await Business.findById(id);
  if (!existingBusiness) {
    throw new ApiError(404, 'Business not found');
  }

  const business = await Business.update(id, {
    is_verified: true,
    status: 'active'
  });

  res.json({
    message: 'Business verified',
    data: business
  });
});
