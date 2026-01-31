/**
 * Models Index
 * Export all models from a single entry point
 */

const User = require('./User');
const Page = require('./Page');
const Event = require('./Event');
const News = require('./News');
const Business = require('./Business');
const Location = require('./Location');

module.exports = {
  User,
  Page,
  Event,
  News,
  Business,
  Location
};
