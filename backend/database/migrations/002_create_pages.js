/**
 * Migration: Create Pages Tables
 */

exports.up = function(knex) {
  return knex.schema
    .createTable('pages', (table) => {
      table.increments('id').primary();
      table.string('slug', 255).notNullable().unique();
      table.string('template', 100).defaultTo('default');
      table.integer('parent_id').unsigned().references('id').inTable('pages').onDelete('SET NULL');
      table.enum('status', ['draft', 'published', 'archived']).defaultTo('draft');
      table.integer('sort_order').defaultTo(0);
      table.string('featured_image', 500);
      table.integer('created_by').unsigned().references('id').inTable('users');
      table.timestamps(true, true);

      table.index('slug');
      table.index('status');
      table.index('parent_id');
    })
    .createTable('page_translations', (table) => {
      table.increments('id').primary();
      table.integer('page_id').unsigned().notNullable().references('id').inTable('pages').onDelete('CASCADE');
      table.string('language', 10).notNullable();
      table.string('title', 255).notNullable();
      table.text('description');
      table.text('content');
      table.string('meta_title', 255);
      table.string('meta_description', 500);

      table.unique(['page_id', 'language']);
      table.index('language');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('page_translations')
    .dropTable('pages');
};
