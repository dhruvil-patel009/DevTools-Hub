import { describe, expect, it } from 'vitest';
import { TOOL_CATEGORIES } from '@/lib/tool-registry/categories';
import { getAllTools, getToolBySlug, searchTools } from '@/lib/tool-registry/tools';

describe('Tool Registry', () => {
  it('defines 8 active categories and 50 tools with unique slugs and ids', () => {
    expect(TOOL_CATEGORIES).toHaveLength(8);
    const tools = getAllTools(true);
    expect(tools).toHaveLength(50);

    const slugs = new Set(tools.map((t) => t.slug));
    const ids = new Set(tools.map((t) => t.id));
    expect(slugs.size).toBe(50);
    expect(ids.size).toBe(50);
  });

  it('finds tools by slug and search query', () => {
    const jsonFormatter = getToolBySlug('json-formatter');
    expect(jsonFormatter?.name).toBe('JSON Formatter');
    expect(jsonFormatter?.route).toBe('/tools/json/json-formatter');

    const matches = searchTools('regex');
    expect(matches.some((t) => t.slug === 'regex-tester')).toBe(true);
  });

  it('marks sensitive tools as unsafe for persistence', () => {
    expect(getToolBySlug('secure-password-generator')?.safeForPersistence).toBe(false);
    expect(getToolBySlug('jwt-decoder')?.safeForPersistence).toBe(false);
    expect(getToolBySlug('hash-generator')?.safeForPersistence).toBe(false);
  });
});
