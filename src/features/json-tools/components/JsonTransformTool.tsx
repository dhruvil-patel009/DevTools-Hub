'use client';

import * as React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { MonacoEditorWrapper } from '@/components/editors/MonacoEditorWrapper';
import { ToolActionsBar } from '@/components/tools/ToolActionsBar';
import { formatJson, minifyJson, validateJson } from '@/features/json-tools/logic';

const EXAMPLE_JSON = `{
  "name": "DevTools Hub",
  "version": "1.0.0",
  "features": ["json-formatter", "regex-tester", "sql-formatter"],
  "privacy": {
    "clientSide": true,
    "logInputs": false
  },
  "largeId": 9007199254740993123
}`;

export function JsonTransformTool({
  mode,
}: {
  mode: 'format' | 'validate' | 'minify';
}) {
  const [input, setInput] = React.useState(EXAMPLE_JSON);
  const [indent, setIndent] = React.useState<2 | 4 | '\t'>(2);

  const result = React.useMemo(() => {
    if (!input.trim()) {
      return { valid: false, output: '', errorMessage: '' };
    }
    if (mode === 'validate') {
      const v = validateJson(input);
      return {
        valid: v.valid,
        output: v.valid ? 'Valid JSON document.' : '',
        errorMessage: v.error
          ? `${v.error.message}${v.error.line ? ` (Line ${v.error.line}, Column ${v.error.column})` : ''}`
          : '',
      };
    }
    if (mode === 'minify') {
      const res = minifyJson(input);
      return res.ok
        ? { valid: true, output: res.output, errorMessage: '' }
        : {
            valid: false,
            output: '',
            errorMessage: `${res.error?.message ?? 'Invalid JSON'}${
              res.error?.line ? ` (Line ${res.error.line}, Column ${res.error.column})` : ''
            }`,
          };
    }
    const res = formatJson(input, indent);
    return res.ok
      ? { valid: true, output: res.output, errorMessage: '' }
      : {
          valid: false,
          output: '',
          errorMessage: `${res.error?.message ?? 'Invalid JSON'}${
            res.error?.line ? ` (Line ${res.error.line}, Column ${res.error.column})` : ''
          }`,
        };
  }, [input, indent, mode]);

  return (
    <div className="space-y-4">
      <ToolActionsBar
        onLoadExample={() => setInput(EXAMPLE_JSON)}
        onClear={() => setInput('')}
        onReset={() => {
          setInput(EXAMPLE_JSON);
          setIndent(2);
        }}
        onUploadText={(text) => setInput(text)}
        acceptFiles=".json,.txt"
        outputText={mode === 'validate' ? undefined : result.output}
        downloadFilename={
          mode === 'minify' ? 'minified.json' : mode === 'format' ? 'formatted.json' : undefined
        }
        downloadMimeType="application/json;charset=utf-8"
        extraActions={
          mode === 'format' ? (
            <select
              aria-label="Indentation"
              value={indent === '\t' ? 'tab' : String(indent)}
              onChange={(e) => {
                const v = e.target.value;
                setIndent(v === 'tab' ? '\t' : (Number(v) as 2 | 4));
              }}
              className="h-8 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-xs"
            >
              <option value="2">2 Spaces</option>
              <option value="4">4 Spaces</option>
              <option value="tab">Tab</option>
            </select>
          ) : undefined
        }
      />

      {input.trim() && (
        <div
          role="status"
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${
            result.valid
              ? 'border-[#22C55E]/30 bg-[#22C55E]/10 text-[#4ADE80]'
              : 'border-[#EF4444]/30 bg-[#EF4444]/10 text-[#F87171]'
          }`}
        >
          {result.valid ? (
            <>
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Valid JSON ({new Blob([input]).size.toLocaleString()} bytes)</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{result.errorMessage}</span>
            </>
          )}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Input JSON
          </span>
          <MonacoEditorWrapper value={input} onChange={setInput} language="json" />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            {mode === 'validate' ? 'Validation Result' : 'Output JSON'}
          </span>
          {mode === 'validate' ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 text-center">
              {result.valid ? (
                <>
                  <CheckCircle2 className="mb-3 h-10 w-10 text-[#22C55E]" />
                  <p className="font-semibold text-[#22C55E]">JSON Syntax is Valid</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Parsed cleanly according to RFC 8259.
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="mb-3 h-10 w-10 text-[#EF4444]" />
                  <p className="font-semibold text-[#EF4444]">Invalid JSON</p>
                  <p className="mt-1 max-w-md font-mono text-xs text-[var(--muted-foreground)]">
                    {result.errorMessage || 'Enter JSON on the left to validate.'}
                  </p>
                </>
              )}
            </div>
          ) : (
            <MonacoEditorWrapper value={result.output} language="json" readOnly />
          )}
        </div>
      </div>
    </div>
  );
}
