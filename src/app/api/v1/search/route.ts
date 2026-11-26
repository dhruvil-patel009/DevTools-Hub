import { NextRequest } from 'next/server';
import { apiSuccess } from '@/server/http/response';
import { searchTools } from '@/lib/tool-registry/tools';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') || '';
  const results = searchTools(q).slice(0, 20);
  return apiSuccess(results);
}
