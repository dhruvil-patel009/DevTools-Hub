import { apiSuccess } from '@/server/http/response';
import { TOOL_CATEGORIES } from '@/lib/tool-registry/categories';
import { getAllTools } from '@/lib/tool-registry/tools';

export async function GET() {
  const tools = getAllTools();
  const categories = TOOL_CATEGORIES.filter((c) => c.isActive).map((cat) => ({
    ...cat,
    toolCount: tools.filter((t) => t.category === cat.slug).length,
  }));

  return apiSuccess(categories);
}
