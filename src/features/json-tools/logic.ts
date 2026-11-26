export interface JsonValidationResult {
  valid: boolean;
  error?: {
    message: string;
    line?: number;
    column?: number;
  };
  parsed?: unknown;
}

function getLineColFromPosition(input: string, position: number): { line: number; column: number } {
  const sliced = input.slice(0, Math.max(0, position));
  const lines = sliced.split('\n');
  return {
    line: lines.length,
    column: (lines[lines.length - 1]?.length ?? 0) + 1,
  };
}

export function validateJson(input: string): JsonValidationResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, error: { message: 'Input is empty.' } };
  }

  try {
    const parsed = JSON.parse(trimmed);
    return { valid: true, parsed };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid JSON';
    const posMatch = message.match(/position\s+(\d+)/i);
    const lineColMatch = message.match(/line\s+(\d+)\s+column\s+(\d+)/i);

    if (lineColMatch) {
      return {
        valid: false,
        error: {
          message,
          line: Number(lineColMatch[1]),
          column: Number(lineColMatch[2]),
        },
      };
    }

    if (posMatch) {
      const { line, column } = getLineColFromPosition(trimmed, Number(posMatch[1]));
      return {
        valid: false,
        error: { message, line, column },
      };
    }

    return { valid: false, error: { message } };
  }
}

/**
 * Preserves large integer literals (> Number.MAX_SAFE_INTEGER) when formatting/minifying
 * by temporarily wrapping them in sentinel tokens before JSON.parse.
 */
const LARGE_INT_SENTINEL_PREFIX = '__DEVTOOLS_BIGINT_';
const LARGE_INT_SENTINEL_SUFFIX = '__';

function quoteLargeIntegers(raw: string): { safeRaw: string; hasBigInts: boolean } {
  let hasBigInts = false;
  // Match integer literals outside quotes (best-effort token-safe pass)
  const safeRaw = raw.replace(
    /("(?:\\.|[^"\\])*")|(?<=[:,\[\s]|^)(-?\d{16,})(?=[,\}\]\s]|$)/g,
    (match, strLiteral, intLiteral) => {
      if (strLiteral) return strLiteral;
      if (intLiteral && !Number.isSafeInteger(Number(intLiteral))) {
        hasBigInts = true;
        return `"${LARGE_INT_SENTINEL_PREFIX}${intLiteral}${LARGE_INT_SENTINEL_SUFFIX}"`;
      }
      return match;
    }
  );
  return { safeRaw, hasBigInts };
}

function restoreLargeIntegers(formatted: string): string {
  return formatted.replace(
    new RegExp(`"${LARGE_INT_SENTINEL_PREFIX}(-?\\d+)${LARGE_INT_SENTINEL_SUFFIX}"`, 'g'),
    '$1'
  );
}

export function formatJson(
  input: string,
  indent: number | '\t' = 2
): { ok: true; output: string } | { ok: false; error: JsonValidationResult['error'] } {
  const validation = validateJson(input);
  if (!validation.valid) {
    return { ok: false, error: validation.error };
  }

  const { safeRaw, hasBigInts } = quoteLargeIntegers(input.trim());
  const parsed = hasBigInts ? JSON.parse(safeRaw) : validation.parsed;
  const formatted = JSON.stringify(parsed, null, indent);
  return {
    ok: true,
    output: hasBigInts ? restoreLargeIntegers(formatted) : formatted,
  };
}

export function minifyJson(
  input: string
): { ok: true; output: string } | { ok: false; error: JsonValidationResult['error'] } {
  const validation = validateJson(input);
  if (!validation.valid) {
    return { ok: false, error: validation.error };
  }

  const { safeRaw, hasBigInts } = quoteLargeIntegers(input.trim());
  const parsed = hasBigInts ? JSON.parse(safeRaw) : validation.parsed;
  const minified = JSON.stringify(parsed);
  return {
    ok: true,
    output: hasBigInts ? restoreLargeIntegers(minified) : minified,
  };
}

export function sortJsonKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJsonKeys);
  }
  if (value !== null && typeof value === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[key] = sortJsonKeys((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}
