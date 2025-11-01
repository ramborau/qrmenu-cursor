// Password verification using Better Auth's algorithm
// Replicating Better Auth's verifyPassword function exactly
import { hex } from "@better-auth/utils/hex";
import { scryptAsync } from "@noble/hashes/scrypt.js";
import * as utils from "@noble/hashes/utils.js";

const config = {
  N: 16384,
  r: 16,
  p: 1,
  dkLen: 64
};

async function generateKey(password: string, salt: string): Promise<Uint8Array> {
  // Better Auth passes salt (hex string) directly to scryptAsync
  // scryptAsync's pbkdf2 internally handles hex strings via utf8ToBytes
  // So we can pass hex string directly, matching Better Auth's behavior
  return await scryptAsync(password.normalize("NFKC"), salt, {
    N: config.N,
    p: config.p,
    r: config.r,
    dkLen: config.dkLen,
    maxmem: 128 * config.N * config.r * 2
  });
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  const aBuffer = new Uint8Array(a);
  const bBuffer = new Uint8Array(b);
  let c = aBuffer.length ^ bBuffer.length;
  const length = Math.max(aBuffer.length, bBuffer.length);
  for (let i = 0; i < length; i++) {
    c |= (i < aBuffer.length ? aBuffer[i] : 0) ^ (i < bBuffer.length ? bBuffer[i] : 0);
  }
  return c === 0;
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  if (!hash || typeof hash !== 'string') {
    throw new Error("Invalid password hash - must be a string");
  }
  const [salt, key] = hash.split(":");
  if (!salt || !key) {
    throw new Error("Invalid password hash format - expected salt:key");
  }

  try {
    const targetKey = await generateKey(password, salt);
    const storedKey = utils.hexToBytes(key);
    return constantTimeEqual(targetKey, storedKey);
  } catch (error: any) {
    console.error("Password verification error:", error.message);
    return false;
  }
}

