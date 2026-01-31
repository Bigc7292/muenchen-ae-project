/**
 * Business Model
 * Business directory (Branchenbuch) entries
 */

const db = require('../utils/db');

const TABLE_NAME = 'businesses';
const TRANSLATIONS_TABLE = 'business_translations';
const CATEGORIES_TABLE = 'business_categories';

class Business {
  /**
   * Find business by ID
   */
  static async findById(id, language = 'de') {
    const business = await db(TABLE_NAME)
      .where({ id })
      .first();

    if (!business) return null;

    const translation = await db(TRANSLATIONS_TABLE)
      .where({ business_id: id, language })
      .first();

    return { ...business, ...translation };
  }

  /**
   * Get all businesses
   */
  static async findAll(options = {}) {
    const { 
      page = 1, 
      limit = 20, 
      language = 'de',
      categoryId = null,
      district = null,
      verified = null
    } = options;
    
    const offset = (page - 1) * limit;

    let query = db(TABLE_NAME)
      .select(
        `${TABLE_NAME}.*`,
        `${TRANSLATIONS_TABLE}.name`,
        `${TRANSLATIONS_TABLE}.description`,
        `${TRANSLATIONS_TABLE}.services`
      )
      .leftJoin(TRANSLATIONS_TABLE, function() {
        this.on(`${TABLE_NAME}.id`, '=', `${TRANSLATIONS_TABLE}.business_id`)
          .andOn(`${TRANSLATIONS_TABLE}.language`, '=', db.raw('?', [language]));
      })
      .where(`${TABLE_NAME}.status`, 'active')
      .orderBy(`${TRANSLATIONS_TABLE}.name`, 'asc')
      .limit(limit)
      .offset(offset);

    if (categoryId) {
      query = query.where(`${TABLE_NAME}.category_id`, categoryId);
    }

    if (district) {
      query = query.where(`${TABLE_NAME}.district`, district);
    }

    if (verified !== null) {
      query = query.where(`${TABLE_NAME}.is_verified`, verified);
    }

    return query;
  }

  /**
   * Search businesses
   */
  static async search(query, language = 'de', options = {}) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;
    const searchTerm = `%${query}%`;

    return db(TABLE_NAME)
      .select(
        `${TABLE_NAME}.*`,
        `${TRANSLATIONS_TABLE}.name`,
        `${TRANSLATIONS_TABLE}.description`
      )
      .leftJoin(TRANSLATIONS_TABLE, function() {
        this.on(`${TABLE_NAME}.id`, '=', `${TRANSLATIONS_TABLE}.business_id`)
          .andOn(`${TRANSLATIONS_TABLE}.language`, '=', db.raw('?', [language]));
      })
      .where(`${TABLE_NAME}.status`, 'active')
      .where(function() {
        this.where(`${TRANSLATIONS_TABLE}.name`, 'ilike', searchTerm)
          .orWhere(`${TRANSLATIONS_TABLE}.description`, 'ilike', searchTerm)
          .orWhere(`${TRANSLATIONS_TABLE}.services`, 'ilike', searchTerm);
      })
      .orderBy(`${TRANSLATIONS_TABLE}.name`, 'asc')
      .limit(limit)
      .offset(offset);
  }

  /**
   * Create business
   */
  static async create(businessData, translations = {}) {
    const [business] = await db(TABLE_NAME)
      .insert({
        category_id: businessData.categoryId,
        district: businessData.district,
        address: businessData.address,
        postal_code: businessData.postalCode,
        city: businessData.city || 'München',
        phone: businessData.phone,
        email: businessData.email,
        website: businessData.website,
        location_lat: businessData.locationLat,
        location_lng: businessData.locationLng,
        opening_hours: JSON.stringify(businessData.openingHours || {}),
        logo: businessData.logo,
        images: JSON.stringify(businessData.images || []),
        is_verified: businessData.isVerified || false,
        is_premium: businessData.isPremium || false,
        status: businessData.status || 'pending',
        owner_id: businessData.ownerId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    for (const [lang, content] of Object.entries(translations)) {
      await db(TRANSLATIONS_TABLE).insert({
        business_id: business.id,
        language: lang,
        name: content.name,
        description: content.description,
        services: content.services
      });
    }

    return business;
  }

  /**
   * Update business
   */
  static async update(id, businessData, translations = {}) {
    const [business] = await db(TABLE_NAME)
      .where({ id })
      .update({
        ...businessData,
        updated_at: new Date()
      })
      .returning('*');

    for (const [lang, content] of Object.entries(translations)) {
      await db(TRANSLATIONS_TABLE)
        .where({ business_id: id, language: lang })
        .update(content);
    }

    return business;
  }

  /**
   * Delete business
   */
  static async delete(id) {
    await db(TRANSLATIONS_TABLE).where({ business_id: id }).del();
    return db(TABLE_NAME).where({ id }).del();
  }

  /**
   * Get categories
   */
  static async getCategories(language = 'de') {
    return db(CATEGORIES_TABLE)
      .select('id', 'slug', 'name', 'icon', 'parent_id')
      .where('language', language)
      .orderBy('name', 'asc');
  }
}

module.exports = Business;
