import fs from 'fs';

/**
 * Retrieves a secret from the file system.
 *
 * @param {string} name The name of the secret to retrieve.
 * @param {string} [fallback] An optional fallback value if the secret is not found.
 * @returns {string} The value of the secret or the fallback.
 */
export function getSecret(name: string, fallback?: string): string {
  const path = `/run/secrets/${name}`;
  if (fs.existsSync(path)) {
    return fs.readFileSync(path, 'utf8').trim();
  }
  if (fallback) return fallback;
  return '';
}
