export function generateSecurePassword(options: {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}): string {
  const sets: string[] = [];
  if (options.uppercase) sets.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  if (options.lowercase) sets.push('abcdefghijklmnopqrstuvwxyz');
  if (options.numbers) sets.push('0123456789');
  if (options.symbols) sets.push('!@#$%^&*()-_=+[]{};:,.<>?');

  const charset = sets.join('');
  if (!charset) return '';

  const length = Math.min(128, Math.max(6, options.length));
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i]! % charset.length];
  }
  return password;
}

export async function computeShaHash(
  input: string,
  algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'
): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest(algorithm, bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const LOREM_SENTENCES = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.',
  'Integer nec odio praesent libero sed cursus ante dapibus diam.',
];

export function generateLoremIpsum(unit: 'paragraphs' | 'sentences' | 'words', count: number): string {
  const safeCount = Math.min(50, Math.max(1, count));
  if (unit === 'sentences') {
    return Array.from({ length: safeCount }, (_, i) => LOREM_SENTENCES[i % LOREM_SENTENCES.length]).join(' ');
  }
  if (unit === 'words') {
    const words = LOREM_SENTENCES.join(' ').split(/\s+/);
    return Array.from({ length: safeCount }, (_, i) => words[i % words.length]).join(' ');
  }
  return Array.from({ length: safeCount }, (_, p) =>
    Array.from({ length: 4 }, (__, s) => LOREM_SENTENCES[(p + s) % LOREM_SENTENCES.length]).join(' ')
  ).join('\n\n');
}
