import { NextResponse } from 'next/server';
import { siteConfig } from '@/config/site';

export async function GET() {
  const spec = {
    openapi: '3.1.0',
    info: {
      title: 'DevTools Hub API',
      version: '1.0.0',
      description: 'Versioned REST API for DevTools Hub.',
    },
    servers: [{ url: siteConfig.url }],
    paths: {
      '/api/health': { get: { summary: 'Application and service health check' } },
      '/api/v1/tools': { get: { summary: 'List enabled developer tools' } },
      '/api/v1/tools/{slug}': { get: { summary: 'Get tool metadata by slug' } },
      '/api/v1/categories': { get: { summary: 'List tool categories' } },
      '/api/v1/search': { get: { summary: 'Search developer tools' } },
      '/api/v1/announcements': { get: { summary: 'List active announcements' } },
      '/api/v1/feedback': { post: { summary: 'Submit user feedback' } },
      '/api/v1/analytics/tool-usage': { post: { summary: 'Record privacy-safe tool execution metadata' } },
      '/api/v1/analytics/popular-tools': { get: { summary: 'Get aggregate popular tools' } },
      '/api/v1/user/profile': { get: { summary: 'Get user profile' }, patch: { summary: 'Update profile' } },
      '/api/v1/user/preferences': { get: { summary: 'Get preferences' }, patch: { summary: 'Update preferences' } },
      '/api/v1/user/favorites': { get: { summary: 'List favorites' }, post: { summary: 'Add favorite' } },
      '/api/v1/user/favorites/{id}': { delete: { summary: 'Remove favorite' } },
      '/api/v1/user/history': { get: { summary: 'List tool history' }, delete: { summary: 'Clear history' } },
      '/api/v1/user/snippets': { get: { summary: 'List snippets' }, post: { summary: 'Create snippet' } },
      '/api/v1/user/snippets/{id}': { patch: { summary: 'Update snippet' }, delete: { summary: 'Delete snippet' } },
      '/api/v1/user/collections': { get: { summary: 'List API collections' }, post: { summary: 'Create collection' } },
      '/api/v1/user/collections/{id}': { patch: { summary: 'Update collection' }, delete: { summary: 'Delete collection' } },
      '/api/v1/user/export': { get: { summary: 'Export user data' } },
      '/api/v1/user/account': { delete: { summary: 'Delete user account' } },
      '/api/v1/ai/explain': { post: { summary: 'Explain code with AI' } },
      '/api/v1/ai/review': { post: { summary: 'Review code with AI' } },
      '/api/v1/ai/documentation': { post: { summary: 'Generate documentation with AI' } },
      '/api/v1/ai/usage': { get: { summary: 'Get daily AI quota status' } },
      '/api/v1/admin/dashboard': { get: { summary: 'Admin overview metrics' } },
      '/api/v1/admin/users': { get: { summary: 'List users' } },
      '/api/v1/admin/users/{id}': { patch: { summary: 'Update user status or role' } },
      '/api/v1/admin/tools': { get: { summary: 'List tools for admin' } },
      '/api/v1/admin/tools/{id}': { patch: { summary: 'Update tool metadata/availability' } },
      '/api/v1/admin/categories': { get: { summary: 'List categories' }, post: { summary: 'Create category' } },
      '/api/v1/admin/categories/{id}': { patch: { summary: 'Update category' } },
      '/api/v1/admin/analytics': { get: { summary: 'Aggregate analytics' } },
      '/api/v1/admin/audit-logs': { get: { summary: 'List audit logs' } },
      '/api/v1/admin/feedback': { get: { summary: 'List feedback' } },
      '/api/v1/admin/feedback/{id}': { patch: { summary: 'Update feedback status' } },
      '/api/v1/admin/settings': { get: { summary: 'List app settings' }, patch: { summary: 'Update app setting' } },
      '/api/v1/admin/feature-flags': { get: { summary: 'List feature flags' } },
      '/api/v1/admin/feature-flags/{id}': { patch: { summary: 'Toggle feature flag' } },
    },
  };

  return NextResponse.json(spec);
}
