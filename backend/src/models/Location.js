/**
 * Location Model
 * Districts (Stadtteile), POIs (Sehenswürdigkeiten), Accommodations (Übernachten)
 */

const db = require('../utils/db');

// Table names
const DISTRICTS_TABLE = 'districts';
const POIS_TABLE = 'points_of_interest';
const ACCOMMODATIONS_TABLE = 'accommodations';

class Location {
  // ==========================================
  // DISTRICTS (Stadtteile)
  // ==========================================

  /**
   * Get all districts
   */
  static async getDistricts(language = 'de') {
    return db(DISTRICTS_TABLE)
      .select(
        `${DISTRICTS_TABLE}.*`,
        'district_translations.name',
        'district_translations.description'
      )
      .leftJoin('district_translations', function() {
        this.on(`${DISTRICTS_TABLE}.id`, '=', 'district_translations.district_id')
          .andOn('district_translations.language', '=', db.raw('?', [language]));
      })
      .orderBy('district_translations.name', 'asc');
  }

  /**
   * Get district by slug
   */
  static async getDistrictBySlug(slug, language = 'de') {
    const district = await db(DISTRICTS_TABLE)
      .where({ slug })
      .first();

    if (!district) return null;

    const translation = await db('district_translations')
      .where({ district_id: district.id, language })
      .first();

    return { ...district, ...translation };
  }

  // ==========================================
  // POINTS OF INTEREST (Sehenswürdigkeiten)
  // ==========================================

  /**
   * Get all POIs
   */
  static async getPOIs(options = {}) {
    const { 
      page = 1, 
      limit = 20, 
      language = 'de',
      category = null,
      districtId = null
    } = options;
    
    const offset = (page - 1) * limit;

    let query = db(POIS_TABLE)
      .select(
        `${POIS_TABLE}.*`,
        'poi_translations.name',
        'poi_translations.description',
        'poi_translations.address'
      )
      .leftJoin('poi_translations', function() {
        this.on(`${POIS_TABLE}.id`, '=', 'poi_translations.poi_id')
          .andOn('poi_translations.language', '=', db.raw('?', [language]));
      })
      .where(`${POIS_TABLE}.status`, 'published')
      .orderBy('poi_translations.name', 'asc')
      .limit(limit)
      .offset(offset);

    if (category) {
      query = query.where(`${POIS_TABLE}.category`, category);
    }

    if (districtId) {
      query = query.where(`${POIS_TABLE}.district_id`, districtId);
    }

    return query;
  }

  /**
   * Get POI by ID
   */
  static async getPOIById(id, language = 'de') {
    const poi = await db(POIS_TABLE)
      .where({ id })
      .first();

    if (!poi) return null;

    const translation = await db('poi_translations')
      .where({ poi_id: id, language })
      .first();

    return { ...poi, ...translation };
  }

  /**
   * Get POI categories
   */
  static async getPOICategories() {
    return db(POIS_TABLE)
      .distinct('category')
      .whereNotNull('category')
      .pluck('category');
  }

  // ==========================================
  // ACCOMMODATIONS (Übernachten)
  // ==========================================

  /**
   * Get all accommodations
   */
  static async getAccommodations(options = {}) {
    const { 
      page = 1, 
      limit = 20, 
      language = 'de',
      type = null,
      stars = null,
      districtId = null
    } = options;
    
    const offset = (page - 1) * limit;

    let query = db(ACCOMMODATIONS_TABLE)
      .select(
        `${ACCOMMODATIONS_TABLE}.*`,
        'accommodation_translations.name',
        'accommodation_translations.description',
        'accommodation_translations.amenities'
      )
      .leftJoin('accommodation_translations', function() {
        this.on(`${ACCOMMODATIONS_TABLE}.id`, '=', 'accommodation_translations.accommodation_id')
          .andOn('accommodation_translations.language', '=', db.raw('?', [language]));
      })
      .where(`${ACCOMMODATIONS_TABLE}.status`, 'active')
      .orderBy('accommodation_translations.name', 'asc')
      .limit(limit)
      .offset(offset);

    if (type) {
      query = query.where(`${ACCOMMODATIONS_TABLE}.type`, type);
    }

    if (stars) {
      query = query.where(`${ACCOMMODATIONS_TABLE}.stars`, stars);
    }

    if (districtId) {
      query = query.where(`${ACCOMMODATIONS_TABLE}.district_id`, districtId);
    }

    return query;
  }

  /**
   * Get accommodation by ID
   */
  static async getAccommodationById(id, language = 'de') {
    const accommodation = await db(ACCOMMODATIONS_TABLE)
      .where({ id })
      .first();

    if (!accommodation) return null;

    const translation = await db('accommodation_translations')
      .where({ accommodation_id: id, language })
      .first();

    return { ...accommodation, ...translation };
  }

  /**
   * Get accommodation types
   */
  static async getAccommodationTypes() {
    return db(ACCOMMODATIONS_TABLE)
      .distinct('type')
      .whereNotNull('type')
      .pluck('type');
  }
}

module.exports = Location;
