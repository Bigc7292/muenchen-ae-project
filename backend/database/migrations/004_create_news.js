/**
 * Migration: Create News Tables
 */

exports.up = function(knex) {
  return knex.schema
    .createTable('news', (table) => {
      table.increments('id').primary();
      table.string('slug', 255).notNullable().unique();
      table.string('category', 100);
      table.string('featured_image', 500);
      table.boolean('is_featured').defaultTo(false);
      table.enum('status', ['draft', 'published', 'archived']).defaultTo('draft');
      table.timestamp('published_at');
      table.integer('author_id').unsigned().references('id').inTable('users');
      table.timestamps(true, true);

      table.index('slug');
      table.index('category');
      table.index('status');
      table.index('published_at');
      table.index('is_featured');
    })
    .createTable('news_translations', (table) => {
      table.increments('id').primary();
      table.integer('news_id').unsigned().notNullable().references('id').inTable('news').onDelete('CASCADE');
      table.string('language', 10).notNullable();
      table.string('title', 255).notNullable();
      table.text('excerpt');
      table.text('content');
      table.string('meta_title', 255);
      table.string('meta_description', 500);

      table.unique(['news_id', 'language']);
      table.index('language');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('news_translations')
    .dropTable('news');
};
