export const HTTP_STATUS_CODES: Array<{
  code: number;
  title: string;
  category: string;
  description: string;
}> = [
  { code: 200, title: 'OK', category: '2xx Success', description: 'The request succeeded.' },
  { code: 201, title: 'Created', category: '2xx Success', description: 'A new resource was created.' },
  { code: 204, title: 'No Content', category: '2xx Success', description: 'Succeeded with no response body.' },
  { code: 301, title: 'Moved Permanently', category: '3xx Redirect', description: 'Resource permanently moved to a new URL.' },
  { code: 304, title: 'Not Modified', category: '3xx Redirect', description: 'Cached version is still valid.' },
  { code: 400, title: 'Bad Request', category: '4xx Client Error', description: 'Malformed syntax or invalid parameters.' },
  { code: 401, title: 'Unauthorized', category: '4xx Client Error', description: 'Authentication credentials required or invalid.' },
  { code: 403, title: 'Forbidden', category: '4xx Client Error', description: 'Authenticated but lacking permission.' },
  { code: 404, title: 'Not Found', category: '4xx Client Error', description: 'The requested resource does not exist.' },
  { code: 409, title: 'Conflict', category: '4xx Client Error', description: 'Request conflicts with current resource state.' },
  { code: 422, title: 'Unprocessable Entity', category: '4xx Client Error', description: 'Semantic validation failed.' },
  { code: 429, title: 'Too Many Requests', category: '4xx Client Error', description: 'Rate limit exceeded.' },
  { code: 500, title: 'Internal Server Error', category: '5xx Server Error', description: 'Unexpected server condition.' },
  { code: 502, title: 'Bad Gateway', category: '5xx Server Error', description: 'Invalid response from upstream server.' },
  { code: 503, title: 'Service Unavailable', category: '5xx Server Error', description: 'Server temporarily overloaded or down.' },
  { code: 504, title: 'Gateway Timeout', category: '5xx Server Error', description: 'Upstream server timed out.' },
];

export function buildCurlCommand(options: {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
}): string {
  const parts = [`curl -X ${options.method} '${options.url}'`];
  for (const [k, v] of Object.entries(options.headers)) {
    if (k.trim()) parts.push(`-H '${k.trim()}: ${v}'`);
  }
  if (options.body && !['GET', 'HEAD'].includes(options.method)) {
    parts.push(`-d '${options.body.replace(/'/g, `'\\''`)}'`);
  }
  return parts.join(' \\\n  ');
}

export function inspectHttpHeaders(raw: string): Array<{
  name: string;
  value: string;
  category: 'Security' | 'CORS' | 'Caching' | 'General';
}> {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.includes(':'))
    .map((line) => {
      const idx = line.indexOf(':');
      const name = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      const lower = name.toLowerCase();
      let category: 'Security' | 'CORS' | 'Caching' | 'General' = 'General';
      if (
        lower.startsWith('access-control-') ||
        lower === 'origin' ||
        lower === 'vary'
      ) {
        category = 'CORS';
      } else if (
        lower.includes('security') ||
        lower.includes('frame-options') ||
        lower.includes('content-security-policy') ||
        lower.includes('x-content-type')
      ) {
        category = 'Security';
      } else if (lower.includes('cache') || lower === 'etag' || lower === 'expires') {
        category = 'Caching';
      }
      return { name, value, category };
    });
}
