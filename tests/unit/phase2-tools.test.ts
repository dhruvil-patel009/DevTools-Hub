import { describe, expect, it } from 'vitest';
import { formatJson, minifyJson, sortJsonKeys, validateJson } from '@/features/json-tools/logic';
import { formatSql } from '@/features/code-tools/logic';
import {
  csvToJson,
  decodeBase64Utf8,
  decodeUrl,
  encodeBase64Utf8,
  encodeUrl,
  jsonToCsv,
  sanitizeCsvCell,
} from '@/features/converters/logic';
import { generateUuidBatch } from '@/features/generators/logic';

describe('JSON Tools Logic', () => {
  it('validates valid and invalid JSON with line/column diagnostics', () => {
    expect(validateJson('{"a":1}').valid).toBe(true);
    const bad = validateJson('{\n  "a": 1,\n  "b": \n}');
    expect(bad.valid).toBe(false);
    expect(bad.error?.message).toBeTruthy();
  });

  it('formats and minifies JSON while preserving large integers', () => {
    const raw = '{"id":9007199254740993123,"ok":true}';
    const formatted = formatJson(raw, 2);
    expect(formatted.ok).toBe(true);
    if (formatted.ok) {
      expect(formatted.output).toContain('9007199254740993123');
      expect(formatted.output).toContain('\n');
    }

    const minified = minifyJson(formatted.ok ? formatted.output : raw);
    expect(minified.ok).toBe(true);
    if (minified.ok) {
      expect(minified.output).toBe(raw);
    }
  });

  it('sorts JSON keys recursively', () => {
    const sorted = sortJsonKeys({ b: 1, a: { d: 2, c: 3 } });
    expect(Object.keys(sorted as Record<string, unknown>)).toEqual(['a', 'b']);
    expect(Object.keys((sorted as Record<string, Record<string, unknown>>).a!)).toEqual(['c', 'd']);
  });
});

describe('SQL Formatter Logic', () => {
  it('formats SQL queries cleanly', () => {
    const res = formatSql('select id, name from users where active = true', 'postgresql', 2);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.output).toContain('SELECT');
      expect(res.output).toContain('FROM');
    }
  });
});

describe('Converters Logic', () => {
  it('protects CSV exports against formula injection', () => {
    expect(sanitizeCsvCell('=CMD("calc")')).toBe("'=CMD(\"calc\")");
    expect(sanitizeCsvCell('+123')).toBe("'+123");
    expect(sanitizeCsvCell('normal')).toBe('normal');

    const csvRes = jsonToCsv('[{"name":"=HYPERLINK()","meta":{"team":"Core"}}]');
    expect(csvRes.ok).toBe(true);
    if (csvRes.ok) {
      expect(csvRes.output).toContain("'=HYPERLINK()");
      expect(csvRes.output).toContain('meta.team');
    }
  });

  it('parses CSV to JSON', () => {
    const res = csvToJson('id,name\n1,Alice\n2,Bob');
    expect(res.ok).toBe(true);
    if (res.ok) {
      const parsed = JSON.parse(res.output);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].name).toBe('Alice');
    }
  });

  it('encodes and decodes UTF-8 Base64 and URL-safe Base64', () => {
    const text = 'DevTools Hub 🚀';
    const encoded = encodeBase64Utf8(text);
    const decoded = decodeBase64Utf8(encoded);
    expect(decoded).toEqual({ ok: true, output: text });

    const urlSafe = encodeBase64Utf8('a+b/c=?', true);
    expect(urlSafe).not.toContain('+');
    expect(urlSafe).not.toContain('/');
    expect(decodeBase64Utf8(urlSafe)).toEqual({ ok: true, output: 'a+b/c=?' });
  });

  it('encodes and decodes URLs safely', () => {
    const raw = 'hello world & more=1';
    const enc = encodeUrl(raw, 'component');
    expect(enc).toBe('hello%20world%20%26%20more%3D1');
    expect(decodeUrl(enc, 'component')).toEqual({ ok: true, output: raw });
    expect(decodeUrl('%E0%A4%A', 'component').ok).toBe(false);
  });
});

describe('UUID Generator Logic', () => {
  it('generates valid v4 UUID batches with formatting options', () => {
    const batch = generateUuidBatch(5, { uppercase: true, hyphens: false });
    expect(batch).toHaveLength(5);
    for (const id of batch) {
      expect(id).toMatch(/^[0-9A-F]{32}$/);
    }
  });
});
