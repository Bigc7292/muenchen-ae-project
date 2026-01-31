/**
 * Seed: Create Admin User
 */

const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  // Delete existing entries
  await knex('users').del();

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);

  await knex('users').insert([
    {
      email: 'admin@yourdomain.com',
      password: hashedPassword,
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      language: 'de',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  console.log('✅ Admin user created: admin@yourdomain.com / admin123');
  console.log('⚠️  Remember to change the password in production!');
};
