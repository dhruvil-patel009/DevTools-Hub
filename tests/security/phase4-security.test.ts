import { describe, expect, it } from 'vitest';
import { TOOL_REGISTRY } from '@/lib/tool-registry/tools';
import { jsonToTypeScript, validateJsonSchema, evaluateJsonPath } from '@/features/json-tools/extended-logic';
import { jsonToYaml, yamlToJson, jsonToXml, xmlToJson } from '@/features/converters/extended-logic';
import { getContrastRatio, hexToRgb, rgbToHsl } from '@/features/css-tools/logic';
import { convertTextCase, countTextStats, decodeJwtUnsafe, sanitizeMarkdownHtml } from '@/features/text-tools/logic';
import { checkRateLimit, resetMemoryRateLimits } from '@/lib/rate-limit';

describe('Extended Toolkit & Security Tests', () => {
  it('covers all 50 tools in registry', () => {
    expect(TOOL_REGISTRY).toHaveLength(50);
  });

  it('generates TypeScript interfaces, validates JSON Schema, and evaluates JSONPath', () => {
    const ts = jsonToTypeScript('{"id":1,"name":"DevTools"}', 'Config');
    expect(ts.ok).toBe(true);
    if (ts.ok) expect(ts.output).toContain('export interface Config');

    const schemaRes = validateJsonSchema('{"id":1}', '{"type":"object","required":["id"]}');
    expect(schemaRes.valid).toBe(true);

    const pathRes = evaluateJsonPath('{"users":[{"name":"Ada"}]}', '$.users[*].name');
    expect(pathRes.ok).toBe(true);
    if (pathRes.ok) expect(pathRes.output).toContain('Ada');
  });

  it('rejects XML DOCTYPE/ENTITY declarations (XXE prevention)', () => {
    const xxe = '<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><root>&xxe;</root>';
    const res = xmlToJson(xxe);
    expect(res.ok).toBe(false);

    const validXml = xmlToJson('<app><name>DevTools</name></app>');
    expect(validXml.ok).toBe(true);
  });

  it('converts JSON <-> YAML and JSON -> XML safely', () => {
    const yml = jsonToYaml('{"a":1,"b":"hello"}');
    expect(yml.ok).toBe(true);
    if (yml.ok) {
      const back = yamlToJson(yml.output);
      expect(back.ok).toBe(true);
    }
    const xml = jsonToXml('{"app":{"port":3000}}');
    expect(xml.ok).toBe(true);
  });

  it('computes color conversions and WCAG contrast ratios', () => {
    const rgb = hexToRgb('#7C3AED');
    expect(rgb).toEqual({ r: 124, g: 58, b: 237 });
    expect(rgbToHsl(rgb!)).toEqual({ h: 262, s: 83, l: 58 });
    expect(getContrastRatio('#FFFFFF', '#000000')).toBe(21);
  });

  it('sanitizes malicious Markdown HTML and decodes JWTs without verifying', () => {
    const clean = sanitizeMarkdownHtml('# Hi\n<script>alert(1)</script>');
    expect(clean).not.toContain('<script>');

    const fakeJwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
      'eyJzdWIiOiIxMjMiLCJyb2xlIjoiVVNFUiJ9.' +
      'signature';
    const decoded = decodeJwtUnsafe(fakeJwt);
    expect(decoded.ok).toBe(true);
    if (decoded.ok) {
      expect(decoded.payload.sub).toBe('123');
    }

    expect(convertTextCase('hello_world', 'camel')).toBe('helloWorld');
    expect(countTextStats('one two three').words).toBe(3);
  });

  it('enforces in-memory rate limits', async () => {
    resetMemoryRateLimits();
    const r1 = await checkRateLimit('test-ip', { limit: 2, windowSeconds: 60 });
    const r2 = await checkRateLimit('test-ip', { limit: 2, windowSeconds: 60 });
    const r3 = await checkRateLimit('test-ip', { limit: 2, windowSeconds: 60 });
    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
    expect(r3.allowed).toBe(false);
  });
});
