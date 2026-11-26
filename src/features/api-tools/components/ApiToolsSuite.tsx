'use client';

import * as React from 'react';
import { Send, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  buildCurlCommand,
  HTTP_STATUS_CODES,
  inspectHttpHeaders,
} from '@/features/api-tools/logic';

export function HttpRequestTesterTool() {
  const [method, setMethod] = React.useState('GET');
  const [url, setUrl] = React.useState('https://jsonplaceholder.typicode.com/todos/1');
  const [headersText, setHeadersText] = React.useState('{\n  "Accept": "application/json"\n}');
  const [bodyText, setBodyText] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [response, setResponse] = React.useState<{
    status: number;
    statusText: string;
    durationMs: number;
    headers: Array<[string, string]>;
    body: string;
  } | null>(null);
  const [error, setError] = React.useState('');
  const abortRef = React.useRef<AbortController | null>(null);

  const sendRequest = async () => {
    setError('');
    setResponse(null);
    let parsedHeaders: Record<string, string> = {};
    try {
      if (headersText.trim()) parsedHeaders = JSON.parse(headersText);
    } catch {
      setError('Request headers must be valid JSON.');
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    const start = performance.now();

    try {
      const res = await fetch(url, {
        method,
        headers: parsedHeaders,
        body: !['GET', 'HEAD'].includes(method) && bodyText ? bodyText : undefined,
        signal: controller.signal,
      });
      const text = await res.text();
      let formatted = text;
      try {
        formatted = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        // plain text
      }
      setResponse({
        status: res.status,
        statusText: res.statusText,
        durationMs: Math.round(performance.now() - start),
        headers: Array.from(res.headers.entries()),
        body: formatted,
      });
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        setError('Request cancelled.');
      } else {
        setError(
          'Browser fetch failed. Note: Requests execute directly from your browser, so the target server must enable CORS headers.'
        );
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const copyCurl = () => {
    let parsedHeaders: Record<string, string> = {};
    try {
      if (headersText.trim()) parsedHeaders = JSON.parse(headersText);
    } catch {
      // ignore
    }
    const curl = buildCurlCommand({ method, url, headers: parsedHeaders, body: bodyText });
    navigator.clipboard.writeText(curl);
    toast.success('Copied cURL command.');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="h-9 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 font-mono text-xs font-bold"
        >
          {['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="min-w-[240px] flex-1 font-mono text-xs"
          placeholder="https://api.example.com/resource"
        />
        {loading ? (
          <Button variant="destructive" size="sm" onClick={() => abortRef.current?.abort()}>
            <XCircle className="h-4 w-4" />
            Cancel
          </Button>
        ) : (
          <Button size="sm" onClick={sendRequest}>
            <Send className="h-4 w-4" />
            Send
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={copyCurl}>
          Copy cURL
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
            Headers (JSON)
          </span>
          <textarea
            value={headersText}
            onChange={(e) => setHeadersText(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs"
          />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
            Request Body
          </span>
          <textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            rows={5}
            disabled={['GET', 'HEAD'].includes(method)}
            placeholder='{"hello": "world"}'
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs disabled:opacity-50"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 p-3 text-xs text-[#F87171]">
          {error}
        </div>
      )}

      {response && (
        <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <Badge variant={response.status < 400 ? 'success' : 'destructive'}>
              {response.status} {response.statusText}
            </Badge>
            <span className="font-mono text-[var(--muted-foreground)]">{response.durationMs} ms</span>
          </div>
          <pre className="max-h-96 overflow-auto rounded-lg bg-[var(--background)] p-3 font-mono text-xs">
            {response.body}
          </pre>
        </div>
      )}
    </div>
  );
}

export function HttpStatusCodeTool() {
  const [query, setQuery] = React.useState('');
  const filtered = HTTP_STATUS_CODES.filter(
    (s) =>
      String(s.code).includes(query.trim()) ||
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter by code (e.g. 404, 429) or keyword..."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <div key={s.code} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-lg font-bold text-[#06B6D4]">{s.code}</span>
              <Badge variant="outline">{s.category}</Badge>
            </div>
            <h3 className="mt-1 font-semibold">{s.title}</h3>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{s.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HttpHeaderInspectorTool() {
  const [raw, setRaw] = React.useState(
    'Content-Type: application/json\nStrict-Transport-Security: max-age=63072000\nAccess-Control-Allow-Origin: *\nCache-Control: no-store'
  );
  const parsed = React.useMemo(() => inspectHttpHeaders(raw), [raw]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        rows={12}
        placeholder="Paste raw HTTP headers (Header-Name: value)..."
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs"
      />
      <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        {parsed.map((h, i) => (
          <div key={i} className="rounded-lg border border-[var(--border)]/60 bg-[var(--background)] p-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono font-semibold">{h.name}</span>
              <Badge variant={h.category === 'Security' ? 'success' : 'cyan'}>{h.category}</Badge>
            </div>
            <p className="mt-1 break-all font-mono text-[var(--muted-foreground)]">{h.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
