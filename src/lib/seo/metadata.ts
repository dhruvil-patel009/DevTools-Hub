import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import type { ToolCategoryDefinition, ToolDefinition } from '@/types/tool';

export function buildToolMetadata(tool: ToolDefinition): Metadata {
  const url = `${siteConfig.url}${tool.route}`;
  return {
    title: tool.seoTitle,
    description: tool.seoDescription,
    keywords: tool.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: tool.seoTitle,
      description: tool.seoDescription,
      url,
      siteName: siteConfig.name,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.seoTitle,
      description: tool.seoDescription,
    },
  };
}

export function buildWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.url}/tools?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildToolJsonLd(
  tool: ToolDefinition,
  category: ToolCategoryDefinition
) {
  const url = `${siteConfig.url}${tool.route}`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: tool.name,
      description: tool.seoDescription,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any (Web Browser)',
      url,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteConfig.url,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: category.name,
          item: `${siteConfig.url}/tools/${category.slug}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: tool.name,
          item: url,
        },
      ],
    },
  ];
}
