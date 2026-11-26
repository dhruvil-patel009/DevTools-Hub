import { NextResponse } from 'next/server';
import crypto from 'crypto';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  pagination?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    requestId: string;
  };
}

export function createRequestId(): string {
  return crypto.randomUUID();
}

export function apiSuccess<T>(
  data: T,
  status = 200,
  pagination?: PaginationMeta
): NextResponse<ApiSuccessResponse<T>> {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(pagination ? { pagination } : {}),
  };
  return NextResponse.json(body, { status });
}

export function apiError(
  code: string,
  message: string,
  status = 400,
  requestId = createRequestId()
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        requestId,
      },
    },
    { status }
  );
}

export function handleUnexpectedError(err: unknown, context: string): NextResponse<ApiErrorResponse> {
  const requestId = createRequestId();
  const safeMessage = err instanceof Error ? err.message : 'Unknown error';
  // Log only safe summary, never raw payloads or stack traces to client
  console.error(`[${context}] requestId=${requestId} error=${safeMessage}`);
  return apiError('INTERNAL_SERVER_ERROR', 'An unexpected error occurred.', 500, requestId);
}
