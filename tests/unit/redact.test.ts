import { describe, expect, it } from 'vitest';
import { REDACTED, redactString, sanitizeHeaders, sanitizeMetadata } from '@/lib/security/redact';

describe('Security Redaction', () => {
  it('redacts sensitive HTTP headers case-insensitively', () => {
    const sanitized = sanitizeHeaders({
      Authorization: 'Bearer super-secret-token',
      'X-API-Key': 'key-12345',
      'Content-Type': 'application/json',
    });

    expect(sanitized.Authorization).toBe(REDACTED);
    expect(sanitized['X-API-Key']).toBe(REDACTED);
    expect(sanitized['Content-Type']).toBe('application/json');
  });

  it('redacts JWTs and Bearer tokens inside strings and nested metadata', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
    expect(redactString(`token=${jwt}`)).toBe(`token=${REDACTED}`);

    const meta = sanitizeMetadata({
      user: 'alice',
      nested: { password: 'secret', note: `Bearer my-token` },
    });
    expect(meta.user).toBe('alice');
    expect((meta.nested as Record<string, unknown>).password).toBe(REDACTED);
    expect((meta.nested as Record<string, unknown>).note).toBe(`Bearer ${REDACTED}`);
  });
});
