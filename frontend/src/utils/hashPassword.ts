/**
 * Hashes a password string using SHA-256 via the Web Crypto API.
 * Returns the hash as a lowercase hexadecimal string.
 * The raw password string is hashed without any transformation.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
