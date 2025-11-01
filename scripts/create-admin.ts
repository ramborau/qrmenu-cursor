import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'rahul@botpe.com';
  const password = 'Ramborau46**';
  const name = 'Rahul Admin';

  console.log('🔐 Creating admin user...');

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('✅ Admin user already exists:', email);
    console.log('   If you need to reset the password, please use the forgot password feature.');
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('🔒 Password hashed');

  // Note: Better Auth uses a different password hashing method
  // For now, we'll create the user and they can sign up through the app
  // Or we can use Better Auth's API endpoint

  console.log('\n⚠️  Note: Better Auth handles password creation differently.');
  console.log('   Please use the signup page at /auth/signup to create the admin user.');
  console.log('\n📝 Admin Credentials:');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Name: ${name}`);
  console.log('\n💡 After signing up, the user role can be updated to OWNER in the database.');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

