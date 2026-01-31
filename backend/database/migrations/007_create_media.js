/**
 * Migration: Create Media Table
 */

exports.up = function(knex) {
  return knex.schema.createTable('media', (table) => {
    table.increments('id').primary();
    table.string('filename', 255).notNullable();
    table.string('original_name', 255);
    table.string('mime_type', 100);
    table.integer('size').unsigned();
    table.integer('width').unsigned();
    table.integer('height').unsigned();
    table.string('url', 1000).notNullable();
    table.string('s3_key', 500);
    table.string('alt_text', 255);
    table.integer('uploaded_by').unsigned().references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('mime_type');
    table.index('uploaded_by');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('media');
};
