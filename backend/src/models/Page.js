/**
 * Page Model
 * Content pages with multi-language support
 */

const db = require('../utils/db');
const slugify = require('slugify');

const TABLE_NAME = 'pages';
const TRANSLATIONS_TABLE = 'page_translations';

class Page {
  /**
   * Find page by ID
   */
  static async findById(id, language = 'de') {
    const page = await db(TABLE_NAME)
      .where({ id })
      .first();

    if (!page) return null;

    const translation = await db(TRANSLATIONS_TABLE)
      .where({ page_id: id, language })
      .first();

    return { ...page, ...translation };
  }

  /**
   * Find page by slug
   */
  static async findBySlug(slug, language = 'de') {
    const page = await db(TABLE_NAME)
      .where({ slug })
      .first();

    if (!page) return null;

    const translation = await db(TRANSLATIONS_TABLE)
      .where({ page_id: page.id, language })
      .first();

    return { ...page, ...translation };
  }

  /**
   * Get all pages
   */
  static async findAll(options = {}) {
    const { 
      page = 1, 
      limit = 20, 
      language = 'de',
      status = 'published',
      parentId = null 
    } = options;
    
    const offset = (page - 1) * limit;

    const pages = await db(TABLE_NAME)
      .select(
        `${TABLE_NAME}.*`,
        `${TRANSLATIONS_TABLE}.title`,
        `${TRANSLATIONS_TABLE}.description`,
        `${TRANSLATIONS_TABLE}.meta_title`,
        `${TRANSLATIONS_TABLE}.meta_description`
      )
      .leftJoin(TRANSLATIONS_TABLE, function() {
        this.on(`${TABLE_NAME}.id`, '=', `${TRANSLATIONS_TABLE}.page_id`)
          .andOn(`${TRANSLATIONS_TABLE}.language`, '=', db.raw('?', [language]));
      })
      .where(`${TABLE_NAME}.status`, status)
      .modify((qb) => {
        if (parentId !== undefined) {
          qb.where(`${TABLE_NAME}.parent_id`, parentId);
        }
      })
      .orderBy(`${TABLE_NAME}.sort_order`, 'asc')
      .limit(limit)
      .offset(offset);

    return pages;
  }

  /**
   * Create new page
   */
  static async create(pageData, translations = {}) {
    const slug = pageData.slug || slugify(translations.de?.title || 'page', { lower: true });

    const [page] = await db(TABLE_NAME)
      .insert({
        slug,
        template: pageData.template || 'default',
        parent_id: pageData.parentId || null,
        status: pageData.status || 'draft',
        sort_order: pageData.sortOrder || 0,
        featured_image: pageData.featuredImage || null,
        created_by: pageData.createdBy,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    // Insert translations
    for (const [lang, content] of Object.entries(translations)) {
      await db(TRANSLATIONS_TABLE).insert({
        page_id: page.id,
        language: lang,
        title: content.title,
        description: content.description || null,
        content: content.content || null,
        meta_title: content.metaTitle || content.title,
        meta_description: content.metaDescription || content.description
      });
    }

    return page;
  }

  /**
   * Update page
   */
  static async update(id, pageData, translations = {}) {
    const [page] = await db(TABLE_NAME)
      .where({ id })
      .update({
        slug: pageData.slug,
        template: pageData.template,
        parent_id: pageData.parentId,
        status: pageData.status,
        sort_order: pageData.sortOrder,
        featured_image: pageData.featuredImage,
        updated_at: new Date()
      })
      .returning('*');

    // Update translations
    for (const [lang, content] of Object.entries(translations)) {
      await db(TRANSLATIONS_TABLE)
        .where({ page_id: id, language: lang })
        .update({
          title: content.title,
          description: content.description,
          content: content.content,
          meta_title: content.metaTitle,
          meta_description: content.metaDescription
        });
    }

    return page;
  }

  /**
   * Delete page
   */
  static async delete(id) {
    await db(TRANSLATIONS_TABLE).where({ page_id: id }).del();
    return db(TABLE_NAME).where({ id }).del();
  }

  /**
   * Get page hierarchy (for navigation)
   */
  static async getHierarchy(language = 'de') {
    const pages = await this.findAll({ 
      language, 
      status: 'published',
      limit: 1000 
    });

    // Build tree structure
    const buildTree = (items, parentId = null) => {
      return items
        .filter(item => item.parent_id === parentId)
        .map(item => ({
          ...item,
          children: buildTree(items, item.id)
        }));
    };

    return buildTree(pages);
  }
}

module.exports = Page;
