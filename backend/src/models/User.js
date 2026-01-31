/**
 * User Model
 * Handles user data and authentication
 */

const db = require('../utils/db');
const bcrypt = require('bcryptjs');

const TABLE_NAME = 'users';

class User {
  /**
   * Find user by ID
   */
  static async findById(id) {
    return db(TABLE_NAME)
      .where({ id })
      .first();
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    return db(TABLE_NAME)
      .where({ email: email.toLowerCase() })
      .first();
  }

  /**
   * Create new user
   */
  static async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const [user] = await db(TABLE_NAME)
      .insert({
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role || 'user',
        language: userData.language || 'de',
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning(['id', 'email', 'first_name', 'last_name', 'role', 'language', 'created_at']);
    
    return user;
  }

  /**
   * Update user
   */
  static async update(id, updates) {
    const [user] = await db(TABLE_NAME)
      .where({ id })
      .update({
        ...updates,
        updated_at: new Date()
      })
      .returning(['id', 'email', 'first_name', 'last_name', 'role', 'language', 'updated_at']);
    
    return user;
  }

  /**
   * Delete user
   */
  static async delete(id) {
    return db(TABLE_NAME)
      .where({ id })
      .del();
  }

  /**
   * Verify password
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Get all users (admin)
   */
  static async findAll(options = {}) {
    const { page = 1, limit = 20, role } = options;
    const offset = (page - 1) * limit;

    let query = db(TABLE_NAME)
      .select('id', 'email', 'first_name', 'last_name', 'role', 'language', 'created_at')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    if (role) {
      query = query.where({ role });
    }

    return query;
  }
}

module.exports = User;
