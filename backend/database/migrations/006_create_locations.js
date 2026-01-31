/**
 * Migration: Create Locations Tables (Districts, POIs, Accommodations)
 */

exports.up = function(knex) {
  return knex.schema
    // Districts
    .createTable('districts', (table) => {
      table.increments('id').primary();
      table.string('slug', 100).notNullable().unique();
      table.decimal('center_lat', 10, 8);
      table.decimal('center_lng', 11, 8);
      table.jsonb('boundaries'); // GeoJSON polygon
      table.string('featured_image', 500);
      table.timestamps(true, true);
    })
    .createTable('district_translations', (table) => {
      table.increments('id').primary();
      table.integer('district_id').unsigned().notNullable().references('id').inTable('districts').onDelete('CASCADE');
      table.string('language', 10).notNullable();
      table.string('name', 255).notNullable();
      table.text('description');

      table.unique(['district_id', 'language']);
    })
    // Points of Interest
    .createTable('points_of_interest', (table) => {
      table.increments('id').primary();
      table.string('category', 100);
      table.integer('district_id').unsigned().references('id').inTable('districts');
      table.decimal('location_lat', 10, 8);
      table.decimal('location_lng', 11, 8);
      table.string('featured_image', 500);
      table.jsonb('images');
      table.string('website', 500);
      table.string('phone', 50);
      table.jsonb('opening_hours');
      table.enum('status', ['draft', 'published', 'archived']).defaultTo('draft');
      table.timestamps(true, true);

      table.index('category');
      table.index('district_id');
      table.index('status');
    })
    .createTable('poi_translations', (table) => {
      table.increments('id').primary();
      table.integer('poi_id').unsigned().notNullable().references('id').inTable('points_of_interest').onDelete('CASCADE');
      table.string('language', 10).notNullable();
      table.string('name', 255).notNullable();
      table.text('description');
      table.string('address', 500);

      table.unique(['poi_id', 'language']);
    })
    // Accommodations
    .createTable('accommodations', (table) => {
      table.increments('id').primary();
      table.enum('type', ['hotel', 'hostel', 'apartment', 'pension', 'camping']).notNullable();
      table.integer('stars').unsigned();
      table.integer('district_id').unsigned().references('id').inTable('districts');
      table.string('address', 500);
      table.decimal('location_lat', 10, 8);
      table.decimal('location_lng', 11, 8);
      table.string('phone', 50);
      table.string('email', 255);
      table.string('website', 500);
      table.string('featured_image', 500);
      table.jsonb('images');
      table.decimal('price_from', 10, 2);
      table.decimal('price_to', 10, 2);
      table.enum('status', ['active', 'inactive']).defaultTo('active');
      table.timestamps(true, true);

      table.index('type');
      table.index('stars');
      table.index('district_id');
      table.index('status');
    })
    .createTable('accommodation_translations', (table) => {
      table.increments('id').primary();
      table.integer('accommodation_id').unsigned().notNullable().references('id').inTable('accommodations').onDelete('CASCADE');
      table.string('language', 10).notNullable();
      table.string('name', 255).notNullable();
      table.text('description');
      table.text('amenities');

      table.unique(['accommodation_id', 'language']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('accommodation_translations')
    .dropTable('accommodations')
    .dropTable('poi_translations')
    .dropTable('points_of_interest')
    .dropTable('district_translations')
    .dropTable('districts');
};
