/**
 * Script to create admin user via API
 * Run this AFTER starting the dev server: npm run dev
 *
 * Usage: node scripts/create-admin-user.js
 */

const fetch = require('node-fetch');

const API_URL = process.env.API_URL || 'http://localhost:3000';
const ADMIN_EMAIL = 'rahul@botpe.com';
const ADMIN_PASSWORD = 'Ramborau46**';
const ADMIN_NAME = 'Rahul Admin';

async function createAdminUser() {
  console.log('🚀 Creating admin user...');
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log('');

  try {
    const response = await fetch(`${API_URL}/api/auth/sign-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: ADMIN_NAME,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Admin user created successfully!');
      console.log('');
      console.log('📝 Next steps:');
      console.log('   1. Update user role to OWNER:');
      console.log('      npx prisma studio');
      console.log('      (Find the user and change role to OWNER)');
      console.log('');
      console.log('   2. Or run SQL:');
      console.log(`      UPDATE users SET role = 'OWNER' WHERE email = '${ADMIN_EMAIL}';`);
      console.log('');
      console.log('   3. Seed sample data:');
      console.log('      npm run db:seed');
    } else {
      console.log('⚠️  Error:', data.message || 'Failed to create user');
      if (data.message?.includes('already exists')) {
        console.log('');
        console.log('💡 User already exists. You can:');
        console.log('   1. Log in at: http://localhost:3000/auth/login');
        console.log('   2. Or update the role manually');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
    console.log('💡 Make sure:');
    console.log('   1. The dev server is running: npm run dev');
    console.log('   2. The API_URL is correct (default: http://localhost:3000)');
  }
}

createAdminUser();

