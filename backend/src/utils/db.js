/**
 * Database Connection Utility
 * Knex.js PostgreSQL connection
 */

const knex = require('knex');
const config = require('../config');

const db = knex({
  client: 'pg',
  connection: {
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password
  },
  pool: config.database.pool,
  acquireConnectionTimeout: 10000
});

// Test connection
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
  });

module.exports = db;
