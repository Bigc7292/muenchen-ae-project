/**
 * Migration: Create Events Tables
 */

exports.up = function(knex) {
  return knex.schema
    .createTable('events', (table) => {
      table.increments('id').primary();
      table.string('category', 100);
      table.timestamp('start_date').notNullable();
      table.timestamp('end_date');
      table.boolean('all_day').defaultTo(false);
      table.jsonb('recurring'); // Recurring event rules
      table.decimal('location_lat', 10, 8);
      table.decimal('location_lng', 11, 8);
      table.string('location_address', 500);
      table.string('featured_image', 500);
      table.boolean('is_featured').defaultTo(false);
      table.enum('status', ['draft', 'published', 'cancelled', 'archived']).defaultTo('draft');
      table.integer('created_by').unsigned().references('id').inTable('users');
      table.timestamps(true, true);

      table.index('category');
      table.index('start_date');
      table.index('status');
      table.index('is_featured');
    })
    .createTable('event_translations', (table) => {
      table.increments('id').primary();
      table.integer('event_id').unsigned().notNullable().references('id').inTable('events').onDelete('CASCADE');
      table.string('language', 10).notNullable();
      table.string('title', 255).notNullable();
      table.text('description');
      table.string('location_name', 255);
      table.string('meta_title', 255);
      table.string('meta_description', 500);

      table.unique(['event_id', 'language']);
      table.index('language');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('event_translations')
    .dropTable('events');
};
