import { PrismaClient } from '@prisma/client';
import { auth } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
  const email = 'rahul@botpe.com';
  const password = 'Ramborau46**';
  const name = 'Rahul Admin';

  console.log('🔐 Creating admin user directly...');

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('⚠️  User already exists. Deleting to recreate...');
    await prisma.account.deleteMany({ where: { userId: existingUser.id } });
    await prisma.session.deleteMany({ where: { userId: existingUser.id } });
    await prisma.user.delete({ where: { id: existingUser.id } });
  }

  // Use Better Auth API to create user
  try {
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
      headers: new Headers(),
    });

    if (result.error) {
      console.error('❌ Error:', result.error);
      throw new Error(result.error.message || 'Failed to create user');
    }

    console.log('✅ User created successfully');

    // Update role to OWNER
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'OWNER' },
      });
      console.log('✅ Role set to OWNER');
    }

    console.log('\n✅ Admin user created!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Role: OWNER');
  } catch (error: any) {
    console.error('❌ Error creating user:', error.message);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

