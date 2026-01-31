/**
 * Event Model
 * Events/Veranstaltungen with multi-language support
 */

const db = require('../utils/db');

const TABLE_NAME = 'events';
const TRANSLATIONS_TABLE = 'event_translations';

class Event {
  /**
   * Find event by ID
   */
  static async findById(id, language = 'de') {
    const event = await db(TABLE_NAME)
      .where({ id })
      .first();

    if (!event) return null;

    const translation = await db(TRANSLATIONS_TABLE)
      .where({ event_id: id, language })
      .first();

    return { ...event, ...translation };
  }

  /**
   * Get all events
   */
  static async findAll(options = {}) {
    const { 
      page = 1, 
      limit = 20, 
      language = 'de',
      category = null,
      startDate = null,
      endDate = null,
      featured = null
    } = options;
    
    const offset = (page - 1) * limit;

    let query = db(TABLE_NAME)
      .select(
        `${TABLE_NAME}.*`,
        `${TRANSLATIONS_TABLE}.title`,
        `${TRANSLATIONS_TABLE}.description`,
        `${TRANSLATIONS_TABLE}.location_name`
      )
      .leftJoin(TRANSLATIONS_TABLE, function() {
        this.on(`${TABLE_NAME}.id`, '=', `${TRANSLATIONS_TABLE}.event_id`)
          .andOn(`${TRANSLATIONS_TABLE}.language`, '=', db.raw('?', [language]));
      })
      .where(`${TABLE_NAME}.status`, 'published')
      .orderBy(`${TABLE_NAME}.start_date`, 'asc')
      .limit(limit)
      .offset(offset);

    if (category) {
      query = query.where(`${TABLE_NAME}.category`, category);
    }

    if (startDate) {
      query = query.where(`${TABLE_NAME}.start_date`, '>=', startDate);
    }

    if (endDate) {
      query = query.where(`${TABLE_NAME}.end_date`, '<=', endDate);
    }

    if (featured !== null) {
      query = query.where(`${TABLE_NAME}.is_featured`, featured);
    }

    return query;
  }

  /**
   * Get upcoming events
   */
  static async getUpcoming(language = 'de', limit = 10) {
    return this.findAll({
      language,
      limit,
      startDate: new Date()
    });
  }

  /**
   * Get events by date
   */
  static async getByDate(date, language = 'de') {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return db(TABLE_NAME)
      .select(
        `${TABLE_NAME}.*`,
        `${TRANSLATIONS_TABLE}.title`,
        `${TRANSLATIONS_TABLE}.description`,
        `${TRANSLATIONS_TABLE}.location_name`
      )
      .leftJoin(TRANSLATIONS_TABLE, function() {
        this.on(`${TABLE_NAME}.id`, '=', `${TRANSLATIONS_TABLE}.event_id`)
          .andOn(`${TRANSLATIONS_TABLE}.language`, '=', db.raw('?', [language]));
      })
      .where(`${TABLE_NAME}.status`, 'published')
      .where(`${TABLE_NAME}.start_date`, '>=', startOfDay)
      .where(`${TABLE_NAME}.start_date`, '<=', endOfDay)
      .orderBy(`${TABLE_NAME}.start_date`, 'asc');
  }

  /**
   * Create new event
   */
  static async create(eventData, translations = {}) {
    const [event] = await db(TABLE_NAME)
      .insert({
        category: eventData.category,
        start_date: eventData.startDate,
        end_date: eventData.endDate,
        all_day: eventData.allDay || false,
        recurring: eventData.recurring || null,
        location_lat: eventData.locationLat,
        location_lng: eventData.locationLng,
        location_address: eventData.locationAddress,
        featured_image: eventData.featuredImage,
        is_featured: eventData.isFeatured || false,
        status: eventData.status || 'draft',
        created_by: eventData.createdBy,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    // Insert translations
    for (const [lang, content] of Object.entries(translations)) {
      await db(TRANSLATIONS_TABLE).insert({
        event_id: event.id,
        language: lang,
        title: content.title,
        description: content.description,
        location_name: content.locationName,
        meta_title: content.metaTitle || content.title,
        meta_description: content.metaDescription || content.description?.substring(0, 160)
      });
    }

    return event;
  }

  /**
   * Update event
   */
  static async update(id, eventData, translations = {}) {
    const [event] = await db(TABLE_NAME)
      .where({ id })
      .update({
        ...eventData,
        updated_at: new Date()
      })
      .returning('*');

    for (const [lang, content] of Object.entries(translations)) {
      await db(TRANSLATIONS_TABLE)
        .where({ event_id: id, language: lang })
        .update(content);
    }

    return event;
  }

  /**
   * Delete event
   */
  static async delete(id) {
    await db(TRANSLATIONS_TABLE).where({ event_id: id }).del();
    return db(TABLE_NAME).where({ id }).del();
  }

  /**
   * Get event categories
   */
  static async getCategories() {
    return db(TABLE_NAME)
      .distinct('category')
      .whereNotNull('category')
      .pluck('category');
  }
}

module.exports = Event;
