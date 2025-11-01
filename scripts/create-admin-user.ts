import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const email = 'rahul@botpe.com';
  const password = 'Ramborau46**';
  const name = 'Rahul Admin';

  console.log('🔐 Creating admin user...');

  // Create user first
  const user = await prisma.user.upsert({
    where: { email },
    update: { role: 'OWNER' },
    create: {
      email,
      name,
      role: 'OWNER',
      emailVerified: true,
    },
  });

  console.log('✅ User created:', user.email);

  // Generate password hash using the same format Better Auth uses
  // Better Auth uses scrypt with format: "salt:hash"
  const salt = crypto.randomBytes(16).toString('hex');

  // Use scrypt to hash password (matching Better Auth's algorithm)
  const hash = await new Promise<string>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey.toString('hex'));
    });
  });

  const passwordHash = `${salt}:${hash}`;

  // Create account manually
  const accountId = crypto.randomBytes(16).toString('hex');
  const userId = user.id;

  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: 'credential',
        providerAccountId: userId,
      },
    },
    update: {
      password: passwordHash,
    },
    create: {
      id: accountId,
      userId: userId,
      type: 'credential',
      provider: 'credential',
      providerAccountId: userId,
      password: passwordHash,
    },
  });

  console.log('✅ Account created with password hash');

  console.log('\n✅ Admin user created successfully!');
  console.log('📧 Email:', email);
  console.log('🔑 Password:', password);
  console.log('👤 Name:', name);
  console.log('🎭 Role: OWNER');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

