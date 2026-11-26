import { marked } from 'marked';
import DOMPurify from 'dompurify';

export function convertTextCase(
  input: string,
  target: 'camel' | 'pascal' | 'snake' | 'kebab' | 'constant' | 'title' | 'upper' | 'lower'
): string {
  if (target === 'upper') return input.toUpperCase();
  if (target === 'lower') return input.toLowerCase();

  const words = input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return '';

  switch (target) {
    case 'camel':
      return words
        .map((w, i) =>
          i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        )
        .join('');
    case 'pascal':
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    case 'snake':
      return words.map((w) => w.toLowerCase()).join('_');
    case 'kebab':
      return words.map((w) => w.toLowerCase()).join('-');
    case 'constant':
      return words.map((w) => w.toUpperCase()).join('_');
    case 'title':
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }
}

export function countTextStats(input: string) {
  const characters = input.length;
  const charactersNoSpaces = input.replace(/\s/g, '').length;
  const words = input.trim() ? input.trim().split(/\s+/).length : 0;
  const lines = input ? input.split(/\r\n|\r|\n/).length : 0;
  const sentences = input.trim() ? input.split(/[.!?]+/).filter((s) => s.trim()).length : 0;
  const bytes = new TextEncoder().encode(input).length;
  const readingMinutes = Math.max(1, Math.ceil(words / 200));

  return { characters, charactersNoSpaces, words, lines, sentences, bytes, readingMinutes };
}

function decodeBase64Url(segment: string): string {
  let base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) base64 += '=';
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}

export function decodeJwtUnsafe(token: string):
  | {
      ok: true;
      header: Record<string, unknown>;
      payload: Record<string, unknown>;
      signaturePresent: boolean;
    }
  | { ok: false; error: string } {
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    return { ok: false, error: 'JWT must contain exactly 3 dot-separated segments.' };
  }
  try {
    const header = JSON.parse(decodeBase64Url(parts[0]!)) as Record<string, unknown>;
    const payload = JSON.parse(decodeBase64Url(parts[1]!)) as Record<string, unknown>;
    return { ok: true, header, payload, signaturePresent: Boolean(parts[2]) };
  } catch {
    return { ok: false, error: 'Failed to decode JWT header or payload.' };
  }
}

export function sanitizeMarkdownHtml(markdown: string): string {
  const rawHtml = marked.parse(markdown, { async: false }) as string;
  if (typeof window === 'undefined') return rawHtml;
  return DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
  });
}
