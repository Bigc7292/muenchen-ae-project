/**
 * Locations Controller
 * Handles districts, POIs, and accommodations
 */

const { Location } = require('../models');
const cache = require('../utils/cache');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

// ==========================================
// DISTRICTS
// ==========================================

/**
 * Get all districts
 */
exports.getDistricts = asyncHandler(async (req, res) => {
  const language = req.query.lang || req.language;
  const cacheKey = `locations:districts:${language}`;
  
  const districts = await cache.getOrSet(cacheKey, async () => {
    return Location.getDistricts(language);
  }, 3600);

  res.json({ data: districts });
});

/**
 * Get district by slug
 */
exports.getDistrictBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const language = req.query.lang || req.language;

  const district = await Location.getDistrictBySlug(slug, language);

  if (!district) {
    throw new ApiError(404, 'District not found');
  }

  res.json({ data: district });
});

// ==========================================
// POINTS OF INTEREST
// ==========================================

/**
 * Get all POIs
 */
exports.getPOIs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, lang, category, districtId } = req.query;
  const language = lang || req.language;

  const pois = await Location.getPOIs({
    page,
    limit,
    language,
    category,
    districtId
  });

  res.json({
    data: pois,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit)
    }
  });
});

/**
 * Get POI categories
 */
exports.getPOICategories = asyncHandler(async (req, res) => {
  const cacheKey = 'locations:poi:categories';
  
  const categories = await cache.getOrSet(cacheKey, async () => {
    return Location.getPOICategories();
  }, 3600);

  res.json({ data: categories });
});

/**
 * Get POI by ID
 */
exports.getPOIById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const language = req.query.lang || req.language;

  const poi = await Location.getPOIById(id, language);

  if (!poi) {
    throw new ApiError(404, 'Point of interest not found');
  }

  res.json({ data: poi });
});

// ==========================================
// ACCOMMODATIONS
// ==========================================

/**
 * Get all accommodations
 */
exports.getAccommodations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, lang, type, stars, districtId } = req.query;
  const language = lang || req.language;

  const accommodations = await Location.getAccommodations({
    page,
    limit,
    language,
    type,
    stars: stars ? parseInt(stars) : null,
    districtId
  });

  res.json({
    data: accommodations,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit)
    }
  });
});

/**
 * Get accommodation types
 */
exports.getAccommodationTypes = asyncHandler(async (req, res) => {
  const cacheKey = 'locations:accommodation:types';
  
  const types = await cache.getOrSet(cacheKey, async () => {
    return Location.getAccommodationTypes();
  }, 3600);

  res.json({ data: types });
});

/**
 * Get accommodation by ID
 */
exports.getAccommodationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const language = req.query.lang || req.language;

  const accommodation = await Location.getAccommodationById(id, language);

  if (!accommodation) {
    throw new ApiError(404, 'Accommodation not found');
  }

  res.json({ data: accommodation });
});
