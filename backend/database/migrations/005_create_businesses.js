/**
 * Migration: Create Business Directory Tables
 */

exports.up = function(knex) {
  return knex.schema
    .createTable('business_categories', (table) => {
      table.increments('id').primary();
      table.string('slug', 100).notNullable();
      table.string('name', 255).notNullable();
      table.string('language', 10).notNullable();
      table.string('icon', 100);
      table.integer('parent_id').unsigned().references('id').inTable('business_categories').onDelete('SET NULL');
      table.integer('sort_order').defaultTo(0);

      table.unique(['slug', 'language']);
      table.index('language');
    })
    .createTable('businesses', (table) => {
      table.increments('id').primary();
      table.integer('category_id').unsigned().references('id').inTable('business_categories');
      table.string('district', 100);
      table.string('address', 500);
      table.string('postal_code', 20);
      table.string('city', 100).defaultTo('München');
      table.string('phone', 50);
      table.string('email', 255);
      table.string('website', 500);
      table.decimal('location_lat', 10, 8);
      table.decimal('location_lng', 11, 8);
      table.jsonb('opening_hours');
      table.string('logo', 500);
      table.jsonb('images');
      table.boolean('is_verified').defaultTo(false);
      table.boolean('is_premium').defaultTo(false);
      table.enum('status', ['pending', 'active', 'suspended', 'archived']).defaultTo('pending');
      table.integer('owner_id').unsigned().references('id').inTable('users');
      table.timestamps(true, true);

      table.index('category_id');
      table.index('district');
      table.index('status');
      table.index('is_verified');
    })
    .createTable('business_translations', (table) => {
      table.increments('id').primary();
      table.integer('business_id').unsigned().notNullable().references('id').inTable('businesses').onDelete('CASCADE');
      table.string('language', 10).notNullable();
      table.string('name', 255).notNullable();
      table.text('description');
      table.text('services');

      table.unique(['business_id', 'language']);
      table.index('language');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('business_translations')
    .dropTable('businesses')
    .dropTable('business_categories');
};
