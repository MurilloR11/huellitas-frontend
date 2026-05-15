// AES-256-GCM encryption via the Web Crypto API.
// The password is stretched with PBKDF2 (100 000 iterations, SHA-256).
// Output layout (base64-encoded): [16-byte salt | 12-byte IV | ciphertext + 16-byte GCM tag].

const ITERATIONS = 100_000;
const KEY_BITS   = 256;
const SALT_BYTES = 16;
const IV_BYTES   = 12;

async function deriveKey(password: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const raw = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    raw,
    { name: 'AES-GCM', length: KEY_BITS },
    false,
    ['encrypt', 'decrypt'],
  );
}

/**
 * Encrypts `plaintext` with a password-derived AES-256-GCM key.
 * Returns a base64 string safe to store or embed in a downloadable file.
 */
export async function encryptText(plaintext: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv   = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key  = await deriveKey(password, salt);
  const ct   = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext),
  );
  const out = new Uint8Array(SALT_BYTES + IV_BYTES + ct.byteLength);
  out.set(salt);
  out.set(iv, SALT_BYTES);
  out.set(new Uint8Array(ct), SALT_BYTES + IV_BYTES);
  return btoa(String.fromCharCode(...out));
}

/**
 * Decrypts a base64 string produced by `encryptText`.
 * Throws if the password is wrong or the data is corrupted (GCM tag mismatch).
 */
export async function decryptText(b64: string, password: string): Promise<string> {
  // Uint8Array.from() allocates a fresh ArrayBuffer, so the cast is safe.
  const buf  = (Uint8Array.from(atob(b64), c => c.charCodeAt(0))).buffer as ArrayBuffer;
  const salt = new Uint8Array(buf, 0, SALT_BYTES);
  const iv   = new Uint8Array(buf, SALT_BYTES, IV_BYTES);
  const ct   = new Uint8Array(buf, SALT_BYTES + IV_BYTES);
  const key  = await deriveKey(password, salt);
  const pt   = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return new TextDecoder().decode(pt);
}
