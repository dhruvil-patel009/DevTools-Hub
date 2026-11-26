import type { ToolCategoryDefinition, CategorySlug } from '@/types/tool';

export const TOOL_CATEGORIES: ToolCategoryDefinition[] = [
  {
    id: 'cat-json',
    name: 'JSON Tools',
    slug: 'json',
    description: 'Format, validate, minify, diff, inspect, and generate TypeScript or schemas from JSON.',
    icon: 'Braces',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'cat-code',
    name: 'Code Tools',
    slug: 'code',
    description: 'Format HTML, CSS, JavaScript, TypeScript, SQL, compare diffs, and run sandboxed previews.',
    icon: 'Code2',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'cat-converters',
    name: 'Data Converters',
    slug: 'converters',
    description: 'Convert safely between JSON, CSV, YAML, XML, Base64, and URL-encoded strings.',
    icon: 'ArrowLeftRight',
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 'cat-css',
    name: 'CSS & Design',
    slug: 'css',
    description: 'Interactive generators for gradients, shadows, border-radius, colors, contrast, Flexbox, and Grid.',
    icon: 'Palette',
    sortOrder: 4,
    isActive: true,
  },
  {
    id: 'cat-generators',
    name: 'Generators',
    slug: 'generators',
    description: 'Generate cryptographic UUIDs, strong passwords, hashes, Lorem Ipsum, QR codes, and timestamps.',
    icon: 'Sparkles',
    sortOrder: 5,
    isActive: true,
  },
  {
    id: 'cat-text',
    name: 'Text & Utilities',
    slug: 'text',
    description: 'Test regular expressions, preview sanitized Markdown, transform text, diff, and decode JWTs.',
    icon: 'FileText',
    sortOrder: 6,
    isActive: true,
  },
  {
    id: 'cat-api',
    name: 'API Developer Tools',
    slug: 'api',
    description: 'Test HTTP endpoints, inspect headers, and look up HTTP status codes.',
    icon: 'Globe',
    sortOrder: 7,
    isActive: true,
  },
  {
    id: 'cat-ai',
    name: 'AI-Powered Tools',
    slug: 'ai',
    description: 'Optional AI-assisted code explanation, code review, and documentation generation.',
    icon: 'Bot',
    sortOrder: 8,
    isActive: true,
  },
];

export const CATEGORY_MAP: Record<CategorySlug, ToolCategoryDefinition> = Object.fromEntries(
  TOOL_CATEGORIES.map((cat) => [cat.slug, cat])
) as Record<CategorySlug, ToolCategoryDefinition>;

export function getCategoryBySlug(slug: string): ToolCategoryDefinition | undefined {
  return TOOL_CATEGORIES.find((c) => c.slug === slug);
}
