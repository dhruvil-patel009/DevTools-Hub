const SENSITIVE_KEY_PATTERN =
  /^(authorization|cookie|set-cookie|x-api-key|api[-_]?key|secret|token|password|passwd|private[-_]?key|access[-_]?token|refresh[-_]?token|id[-_]?token|bearer)$/i;

const JWT_PATTERN = /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g;
const BEARER_PATTERN = /\bBearer\s+[A-Za-z0-9\-._~+/]+=*/gi;

export const REDACTED = '[REDACTED]';

export function redactString(input: string): string {
  return input.replace(BEARER_PATTERN, `Bearer ${REDACTED}`).replace(JWT_PATTERN, REDACTED);
}

export function sanitizeHeaders(
  headers: Record<string, string>
): Record<string, string> {
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (SENSITIVE_KEY_PATTERN.test(key.trim())) {
      sanitized[key] = REDACTED;
    } else {
      sanitized[key] = redactString(value);
    }
  }
  return sanitized;
}

export function sanitizeMetadata(
  obj: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEY_PATTERN.test(key.trim())) {
      result[key] = REDACTED;
    } else if (typeof value === 'string') {
      result[key] = redactString(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === 'object' && item !== null
          ? sanitizeMetadata(item as Record<string, unknown>)
          : typeof item === 'string'
            ? redactString(item)
            : item
      );
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeMetadata(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}
