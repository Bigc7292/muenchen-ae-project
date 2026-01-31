/**
 * News Model
 * News articles (Aktuell/Nachrichten) with multi-language support
 */

const db = require('../utils/db');
const slugify = require('slugify');

const TABLE_NAME = 'news';
const TRANSLATIONS_TABLE = 'news_translations';

class News {
  /**
   * Find news by ID
   */
  static async findById(id, language = 'de') {
    const news = await db(TABLE_NAME)
      .where({ id })
      .first();

    if (!news) return null;

    const translation = await db(TRANSLATIONS_TABLE)
      .where({ news_id: id, language })
      .first();

    return { ...news, ...translation };
  }

  /**
   * Find news by slug
   */
  static async findBySlug(slug, language = 'de') {
    const news = await db(TABLE_NAME)
      .where({ slug })
      .first();

    if (!news) return null;

    const translation = await db(TRANSLATIONS_TABLE)
      .where({ news_id: news.id, language })
      .first();

    return { ...news, ...translation };
  }

  /**
   * Get all news
   */
  static async findAll(options = {}) {
    const { 
      page = 1, 
      limit = 20, 
      language = 'de',
      category = null,
      featured = null
    } = options;
    
    const offset = (page - 1) * limit;

    let query = db(TABLE_NAME)
      .select(
        `${TABLE_NAME}.*`,
        `${TRANSLATIONS_TABLE}.title`,
        `${TRANSLATIONS_TABLE}.excerpt`,
        `${TRANSLATIONS_TABLE}.content`
      )
      .leftJoin(TRANSLATIONS_TABLE, function() {
        this.on(`${TABLE_NAME}.id`, '=', `${TRANSLATIONS_TABLE}.news_id`)
          .andOn(`${TRANSLATIONS_TABLE}.language`, '=', db.raw('?', [language]));
      })
      .where(`${TABLE_NAME}.status`, 'published')
      .where(`${TABLE_NAME}.published_at`, '<=', new Date())
      .orderBy(`${TABLE_NAME}.published_at`, 'desc')
      .limit(limit)
      .offset(offset);

    if (category) {
      query = query.where(`${TABLE_NAME}.category`, category);
    }

    if (featured !== null) {
      query = query.where(`${TABLE_NAME}.is_featured`, featured);
    }

    return query;
  }

  /**
   * Get latest news
   */
  static async getLatest(language = 'de', limit = 5) {
    return this.findAll({ language, limit });
  }

  /**
   * Create news article
   */
  static async create(newsData, translations = {}) {
    const slug = newsData.slug || slugify(translations.de?.title || 'news', { lower: true });

    const [news] = await db(TABLE_NAME)
      .insert({
        slug,
        category: newsData.category,
        featured_image: newsData.featuredImage,
        is_featured: newsData.isFeatured || false,
        status: newsData.status || 'draft',
        published_at: newsData.publishedAt || null,
        author_id: newsData.authorId,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    for (const [lang, content] of Object.entries(translations)) {
      await db(TRANSLATIONS_TABLE).insert({
        news_id: news.id,
        language: lang,
        title: content.title,
        excerpt: content.excerpt,
        content: content.content,
        meta_title: content.metaTitle || content.title,
        meta_description: content.metaDescription || content.excerpt
      });
    }

    return news;
  }

  /**
   * Update news article
   */
  static async update(id, newsData, translations = {}) {
    const [news] = await db(TABLE_NAME)
      .where({ id })
      .update({
        ...newsData,
        updated_at: new Date()
      })
      .returning('*');

    for (const [lang, content] of Object.entries(translations)) {
      await db(TRANSLATIONS_TABLE)
        .where({ news_id: id, language: lang })
        .update(content);
    }

    return news;
  }

  /**
   * Delete news article
   */
  static async delete(id) {
    await db(TRANSLATIONS_TABLE).where({ news_id: id }).del();
    return db(TABLE_NAME).where({ id }).del();
  }

  /**
   * Get news categories
   */
  static async getCategories() {
    return db(TABLE_NAME)
      .distinct('category')
      .whereNotNull('category')
      .pluck('category');
  }
}

module.exports = News;
