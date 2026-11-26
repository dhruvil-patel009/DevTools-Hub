import { PrismaClient, ProcessingMode } from '@prisma/client';
import { TOOL_CATEGORIES } from '../src/lib/tool-registry/categories';
import { TOOL_REGISTRY } from '../src/lib/tool-registry/tools';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding DevTools Hub database...');

  const categoryIdMap = new Map<string, string>();

  for (const cat of TOOL_CATEGORIES) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
      },
    });
    categoryIdMap.set(cat.slug, upserted.id);
  }

  for (const tool of TOOL_REGISTRY) {
    const categoryId = categoryIdMap.get(tool.category);
    if (!categoryId) {
      throw new Error(`Missing category for tool ${tool.slug}: ${tool.category}`);
    }

    await prisma.tool.upsert({
      where: { slug: tool.slug },
      update: {
        categoryId,
        name: tool.name,
        description: tool.description,
        keywords: tool.keywords,
        icon: tool.icon,
        processingMode:
          tool.processingMode === 'server' ? ProcessingMode.SERVER : ProcessingMode.CLIENT,
        isActive: tool.isActive,
        isFeatured: tool.isFeatured,
        requiresAuth: tool.requiresAuth,
        requiresAI: tool.requiresAI,
        seoTitle: tool.seoTitle,
        seoDescription: tool.seoDescription,
        sortOrder: tool.sortOrder,
      },
      create: {
        categoryId,
        name: tool.name,
        slug: tool.slug,
        description: tool.description,
        keywords: tool.keywords,
        icon: tool.icon,
        processingMode:
          tool.processingMode === 'server' ? ProcessingMode.SERVER : ProcessingMode.CLIENT,
        isActive: tool.isActive,
        isFeatured: tool.isFeatured,
        requiresAuth: tool.requiresAuth,
        requiresAI: tool.requiresAI,
        seoTitle: tool.seoTitle,
        seoDescription: tool.seoDescription,
        sortOrder: tool.sortOrder,
      },
    });
  }

  const defaultSettings: Array<{ key: string; value: unknown }> = [
    { key: 'ai.dailyLimit', value: { limit: 25 } },
    { key: 'analytics.retentionDays', value: { days: 90 } },
    { key: 'rateLimit.publicApiPerMinute', value: { limit: 60 } },
    { key: 'seo.siteName', value: { value: 'DevTools Hub' } },
  ];

  for (const setting of defaultSettings) {
    await prisma.appSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        key: setting.key,
        value: setting.value as object,
      },
    });
  }

  const defaultFlags = [
    {
      key: 'ai_tools_enabled',
      enabled: true,
      description: 'Enable optional Gemini AI-powered developer tools when API key is configured.',
    },
    {
      key: 'public_feedback_enabled',
      enabled: true,
      description: 'Allow visitors and users to submit feedback via the public feedback API.',
    },
    {
      key: 'registration_enabled',
      enabled: true,
      description: 'Allow new user account registration.',
    },
  ];

  for (const flag of defaultFlags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {},
      create: flag,
    });
  }

  console.log(
    `Seeded ${TOOL_CATEGORIES.length} categories and ${TOOL_REGISTRY.length} tools successfully.`
  );
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
