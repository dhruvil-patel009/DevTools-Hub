import { NextRequest } from 'next/server';
import { handleAiRoute } from '@/server/services/ai-service';

export async function POST(request: NextRequest) {
  return handleAiRoute(request, 'review');
}
