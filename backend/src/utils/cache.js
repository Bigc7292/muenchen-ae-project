/**
 * Cache Utility
 * Redis-based caching
 */

const { createClient } = require('redis');
const config = require('../config');
const logger = require('./logger');

let client = null;

const initCache = async () => {
  try {
    client = createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port
      },
      password: config.redis.password || undefined
    });

    client.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    client.on('connect', () => {
      logger.info('✅ Redis connected successfully');
    });

    await client.connect();
    return client;
  } catch (error) {
    logger.warn('⚠️ Redis connection failed, caching disabled:', error.message);
    return null;
  }
};

const cache = {
  /**
   * Initialize cache connection
   */
  init: initCache,

  /**
   * Get value from cache
   */
  async get(key) {
    if (!client) return null;
    try {
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  },

  /**
   * Set value in cache
   */
  async set(key, value, ttlSeconds = 3600) {
    if (!client) return false;
    try {
      await client.setEx(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  },

  /**
   * Delete value from cache
   */
  async del(key) {
    if (!client) return false;
    try {
      await client.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  },

  /**
   * Clear cache by pattern
   */
  async clearPattern(pattern) {
    if (!client) return false;
    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
      return true;
    } catch (error) {
      logger.error('Cache clear pattern error:', error);
      return false;
    }
  },

  /**
   * Get or set (cache-aside pattern)
   */
  async getOrSet(key, fetchFn, ttlSeconds = 3600) {
    const cached = await this.get(key);
    if (cached) return cached;

    const value = await fetchFn();
    await this.set(key, value, ttlSeconds);
    return value;
  }
};

module.exports = cache;
