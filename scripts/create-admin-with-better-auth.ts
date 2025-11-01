import { PrismaClient } from '@prisma/client';
import { auth } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
  const email = 'rahul@botpe.com';
  const password = 'Ramborau46**';
  const name = 'Rahul Admin';

  console.log('🔐 Creating admin user using Better Auth...');

  // Delete existing user if any
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('⚠️  User exists, deleting...');
    await prisma.account.deleteMany({ where: { userId: existingUser.id } });
    await prisma.session.deleteMany({ where: { userId: existingUser.id } });
    await prisma.user.delete({ where: { id: existingUser.id } });
  }

  // Try to create user via Better Auth API
  try {
    const response = await fetch('http://localhost:3006/api/auth/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    const result = await response.json();

    if (result.error || response.status !== 200) {
      console.error('❌ Signup API error:', result);

      // Extract password hash from error if available
      if (result.message?.includes('password:')) {
        const passwordMatch = result.message.match(/password:\s*"([^"]+)"/);
        if (passwordMatch) {
          const passwordHash = passwordMatch[1];
          console.log('📝 Extracted password hash from error');

          // Create user manually
          const user = await prisma.user.create({
            data: {
              email,
              name,
              role: 'OWNER',
              emailVerified: true,
            },
          });

          // Create account with extracted hash
          await prisma.account.create({
            data: {
              userId: user.id,
              type: 'credential',
              provider: 'credential',
              providerAccountId: user.id,
              password: passwordHash,
            },
          });

          console.log('✅ User and account created manually with extracted hash');
          console.log('\n✅ Admin user created!');
          console.log('📧 Email:', email);
          console.log('🔑 Password:', password);
          console.log('👤 Role: OWNER');
          return;
        }
      }

      // If we can't extract hash, create user and let them signup via UI
      const user = await prisma.user.create({
        data: {
          email,
          name,
          role: 'OWNER',
          emailVerified: true,
        },
      });

      console.log('✅ User created. Account creation failed due to schema mismatch.');
      console.log('📍 Please try signup at http://localhost:3006/auth/signup');
      console.log('   The user already exists, so signup will show error but account may be created.');
      return;
    }

    console.log('✅ User created via Better Auth API');

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
    console.error('❌ Error:', error.message);
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

