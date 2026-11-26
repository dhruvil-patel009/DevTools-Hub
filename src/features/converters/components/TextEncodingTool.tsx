'use client';

import * as React from 'react';
import { ToolActionsBar } from '@/components/tools/ToolActionsBar';
import {
  decodeBase64Utf8,
  decodeUrl,
  encodeBase64Utf8,
  encodeUrl,
} from '@/features/converters/logic';

export function TextEncodingTool({ type }: { type: 'base64' | 'url' }) {
  const defaultInput =
    type === 'base64'
      ? 'DevTools Hub — Everything developers need. 🚀'
      : 'https://devtools.local/search?q=json formatter&tag=web+dev';

  const [mode, setMode] = React.useState<'encode' | 'decode'>('encode');
  const [urlSafe, setUrlSafe] = React.useState(false);
  const [urlMode, setUrlMode] = React.useState<'component' | 'full'>('component');
  const [input, setInput] = React.useState(defaultInput);

  const result = React.useMemo(() => {
    if (!input) return { ok: true as const, output: '' };
    if (type === 'base64') {
      return mode === 'encode'
        ? { ok: true as const, output: encodeBase64Utf8(input, urlSafe) }
        : decodeBase64Utf8(input);
    }
    return mode === 'encode'
      ? { ok: true as const, output: encodeUrl(input, urlMode) }
      : decodeUrl(input, urlMode);
  }, [input, type, mode, urlSafe, urlMode]);

  return (
    <div className="space-y-4">
      <ToolActionsBar
        onLoadExample={() => {
          setMode('encode');
          setInput(defaultInput);
        }}
        onClear={() => setInput('')}
        onReset={() => {
          setMode('encode');
          setInput(defaultInput);
        }}
        outputText={result.ok ? result.output : ''}
        downloadFilename={type === 'base64' ? 'base64-output.txt' : 'url-output.txt'}
        extraActions={
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Conversion mode"
              value={mode}
              onChange={(e) => setMode(e.target.value as 'encode' | 'decode')}
              className="h-8 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-xs"
            >
              <option value="encode">Encode</option>
              <option value="decode">Decode</option>
            </select>

            {type === 'base64' ? (
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[var(--border)] px-2.5 py-1 text-xs">
                <input
                  type="checkbox"
                  checked={urlSafe}
                  onChange={(e) => setUrlSafe(e.target.checked)}
                />
                URL-Safe
              </label>
            ) : (
              <select
                aria-label="URL encoding scope"
                value={urlMode}
                onChange={(e) => setUrlMode(e.target.value as 'component' | 'full')}
                className="h-8 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-xs"
              >
                <option value="component">Component (encodeURIComponent)</option>
                <option value="full">Full URI (encodeURI)</option>
              </select>
            )}
          </div>
        }
      />

      {!result.ok && (
        <div className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-2 text-xs text-[#F87171]">
          {result.error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="encoding-input"
            className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]"
          >
            Input
          </label>
          <textarea
            id="encoding-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={12}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="encoding-output"
            className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]"
          >
            Output
          </label>
          <textarea
            id="encoding-output"
            readOnly
            value={result.ok ? result.output : ''}
            rows={12}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 font-mono text-sm focus-visible:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
