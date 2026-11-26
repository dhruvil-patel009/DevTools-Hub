export type CategorySlug =
  | 'json'
  | 'code'
  | 'converters'
  | 'css'
  | 'generators'
  | 'text'
  | 'api'
  | 'ai';

export type ProcessingMode = 'client' | 'server';

export interface ToolCategoryDefinition {
  id: string;
  name: string;
  slug: CategorySlug;
  description: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ToolDefinition {
  id: string;
  name: string;
  slug: string;
  category: CategorySlug;
  description: string;
  keywords: string[];
  icon: string;
  route: string;
  isActive: boolean;
  isFeatured: boolean;
  seoTitle: string;
  seoDescription: string;
  processingMode: ProcessingMode;
  requiresAuth: boolean;
  requiresAI: boolean;
  safeForPersistence: boolean;
  componentKey: string;
  sortOrder: number;
  instructions: string[];
  faqs: Array<{ question: string; answer: string }>;
  relatedSlugs: string[];
}
