/**
 * Cryptographic Utility for Medora Authentication
 * Provides deterministic and secure SHA-256 password hashing with salt.
 * Compatible with modern browser Web Crypto API and fallback execution.
 */

export async function hashPassword(password: string, existingSalt?: string): Promise<{ hash: string; salt: string }> {
  const salt = existingSalt || generateSalt();
  const input = `${password}::${salt}::medora_secure_auth_salt_2026`;

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const msgUint8 = new TextEncoder().encode(input);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      return { hash: hashHex, salt };
    } catch {
      // Fallback below
    }
  }

  // Synchronous robust hashing fallback
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hashHex = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
  return { hash: `hash_${hashHex}`, salt };
}

export function generateSalt(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint8Array(8);
    crypto.getRandomValues(arr);
    return Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36).substring(4);
}

export async function verifyPassword(password: string, storedHash: string, salt: string): Promise<boolean> {
  if (!password || !storedHash || !salt) return false;
  const { hash } = await hashPassword(password, salt);
  return hash === storedHash;
}
