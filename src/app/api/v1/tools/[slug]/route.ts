import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/server/http/response';
import { getToolBySlug } from '@/lib/tool-registry/tools';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const tool = getToolBySlug(slug);

  if (!tool || !tool.isActive) {
    return apiError('TOOL_NOT_FOUND', 'Requested developer tool was not found.', 404);
  }

  return apiSuccess(tool);
}
