// Password verification using Better Auth's algorithm
import { hex } from "@better-auth/utils/hex";
import { scryptAsync } from "@noble/hashes/scrypt.js";
import { hexToBytes } from "@noble/hashes/utils";

const config = {
  N: 16384,
  r: 16,
  p: 1,
  dkLen: 64
};

async function generateKey(password: string, salt: string): Promise<Uint8Array> {
  const saltBytes = hexToBytes(salt);
  return scryptAsync(password.normalize("NFKC"), saltBytes, {
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
  const targetKey = await generateKey(password, salt);
  const storedKey = hexToBytes(key);
  return constantTimeEqual(targetKey, storedKey);
}

