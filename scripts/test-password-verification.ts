// Test password verification using Better Auth's algorithm
import * as crypto from 'crypto';
import { hex } from '@better-auth/utils/hex';

const config = {
  N: 16384,
  r: 16,
  p: 1,
  dkLen: 64
};

async function generateKey(password: string, salt: string): Promise<Uint8Array> {
  const { scryptAsync } = await import('@noble/hashes/scrypt');
  return scryptAsync(password.normalize('NFKC'), hex.hex.decode(salt), {
    N: config.N,
    p: config.p,
    r: config.r,
    dkLen: config.dkLen,
    maxmem: 128 * config.N * config.r * 2
  });
}

async function verifyPassword(hash: string, password: string): Promise<boolean> {
  const [salt, key] = hash.split(':');
  if (!salt || !key) {
    throw new Error('Invalid password hash');
  }

  const targetKey = await generateKey(password, salt);
  const storedKey = hex.hex.decode(key);

  // Constant time comparison
  if (targetKey.length !== storedKey.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < targetKey.length; i++) {
    result |= targetKey[i] ^ storedKey[i];
  }
  return result === 0;
}

async function main() {
  const password = 'Ramborau46**';
  const hash = '190eee144a65f30541ee199348ae6b3e:551fdda69b11d9c1e0df857efb1a9fc4407607bec46b6ae2b04913e9addc8a5664934d8ef43f258273dcdd397553208719405c9ad67adb084caadd0c4d3db5d3';

  console.log('Testing password verification...');
  console.log('Password:', password);
  console.log('Hash:', hash);

  try {
    const isValid = await verifyPassword(hash, password);
    console.log('Result:', isValid ? '✅ Valid' : '❌ Invalid');
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

main().catch(console.error);

