import { NextRequest } from 'next/server';
import { apiSuccess } from '@/server/http/response';
import { getAllTools, searchTools } from '@/lib/tool-registry/tools';
import type { CategorySlug } from '@/types/tool';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get('category') as CategorySlug | null;
  const featured = searchParams.get('featured');
  const q = searchParams.get('q');
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 50)));

  let list = q ? searchTools(q) : getAllTools();

  if (category) {
    list = list.filter((t) => t.category === category);
  }
  if (featured === 'true') {
    list = list.filter((t) => t.isFeatured);
  }

  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const paginated = list.slice(start, start + limit);

  return apiSuccess(paginated, 200, { page, limit, total, totalPages });
}
