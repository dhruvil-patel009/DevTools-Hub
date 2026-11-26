import Papa from 'papaparse';

const FORMULA_PREFIX_REGEX = /^[=+\-@\t\r]/;

/**
 * Protects spreadsheet CSV cells from formula injection (CWE-1236).
 */
export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (FORMULA_PREFIX_REGEX.test(str)) {
    return `'${str}`;
  }
  return str;
}

function flattenObject(
  obj: Record<string, unknown>,
  prefix = '',
  out: Record<string, unknown> = {}
): Record<string, unknown> {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      flattenObject(value as Record<string, unknown>, fullKey, out);
    } else if (Array.isArray(value)) {
      out[fullKey] = JSON.stringify(value);
    } else {
      out[fullKey] = value;
    }
  }
  return out;
}

export function jsonToCsv(
  input: string,
  options: { protectFormulas?: boolean; delimiter?: string } = {}
): { ok: true; output: string } | { ok: false; error: string } {
  const { protectFormulas = true, delimiter = ',' } = options;
  try {
    const parsed = JSON.parse(input);
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    if (rows.length === 0) {
      return { ok: true, output: '' };
    }

    const flattenedRows = rows.map((row) => {
      if (row !== null && typeof row === 'object' && !Array.isArray(row)) {
        const flat = flattenObject(row as Record<string, unknown>);
        if (!protectFormulas) return flat;
        const safe: Record<string, string> = {};
        for (const [k, v] of Object.entries(flat)) {
          safe[k] = sanitizeCsvCell(v);
        }
        return safe;
      }
      return { value: protectFormulas ? sanitizeCsvCell(row) : String(row ?? '') };
    });

    const csv = Papa.unparse(flattenedRows, { delimiter });
    return { ok: true, output: csv };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Invalid JSON input for CSV conversion.',
    };
  }
}

export function csvToJson(
  input: string,
  options: { header?: boolean; delimiter?: string } = {}
): { ok: true; output: string } | { ok: false; error: string } {
  const { header = true, delimiter = '' } = options;
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: 'CSV input is empty.' };
  }

  const parsed = Papa.parse(trimmed, {
    header,
    skipEmptyLines: true,
    dynamicTyping: true,
    delimiter: delimiter || undefined,
  });

  if (parsed.errors.length > 0) {
    return {
      ok: false,
      error: parsed.errors[0]?.message || 'Failed to parse CSV.',
    };
  }

  return { ok: true, output: JSON.stringify(parsed.data, null, 2) };
}

export function encodeBase64Utf8(input: string, urlSafe = false): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  const base64 = btoa(binary);
  if (!urlSafe) return base64;
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeBase64Utf8(
  input: string
): { ok: true; output: string } | { ok: false; error: string } {
  try {
    let normalized = input.trim().replace(/-/g, '+').replace(/_/g, '/');
    while (normalized.length % 4 !== 0) {
      normalized += '=';
    }
    const binary = atob(normalized);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return { ok: true, output: new TextDecoder('utf-8', { fatal: true }).decode(bytes) };
  } catch {
    return { ok: false, error: 'Invalid Base64 string or non-UTF-8 byte sequence.' };
  }
}

export function encodeUrl(input: string, mode: 'component' | 'full' = 'component'): string {
  return mode === 'component' ? encodeURIComponent(input) : encodeURI(input);
}

export function decodeUrl(
  input: string,
  mode: 'component' | 'full' = 'component'
): { ok: true; output: string } | { ok: false; error: string } {
  try {
    return {
      ok: true,
      output: mode === 'component' ? decodeURIComponent(input) : decodeURI(input),
    };
  } catch {
    return { ok: false, error: 'Malformed URL-encoded sequence.' };
  }
}
