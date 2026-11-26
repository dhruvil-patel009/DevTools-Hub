import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { TOOL_CATEGORIES } from '@/lib/tool-registry/categories';
import { getAllTools } from '@/lib/tool-registry/tools';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteConfig.url}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteConfig.url}/tools`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteConfig.url}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteConfig.url}/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteConfig.url}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteConfig.url}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = TOOL_CATEGORIES.filter((c) => c.isActive).map(
    (cat) => ({
      url: `${siteConfig.url}/tools/${cat.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  );

  const toolRoutes: MetadataRoute.Sitemap = getAllTools().map((tool) => ({
    url: `${siteConfig.url}${tool.route}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: tool.isFeatured ? 0.9 : 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...toolRoutes];
}
