'use client';

import * as React from 'react';
import { MonacoEditorWrapper } from '@/components/editors/MonacoEditorWrapper';
import { ToolActionsBar } from '@/components/tools/ToolActionsBar';
import { csvToJson, jsonToCsv } from '@/features/converters/logic';

const JSON_EXAMPLE = `[
  { "id": 1, "name": "Alice", "role": "Engineer", "meta": { "team": "Core" } },
  { "id": 2, "name": "Bob", "role": "Designer", "meta": { "team": "UI" } }
]`;

const CSV_EXAMPLE = `id,name,role,team\n1,Alice,Engineer,Core\n2,Bob,Designer,UI`;

export function CsvJsonConverterTool({ direction }: { direction: 'json-to-csv' | 'csv-to-json' }) {
  const defaultInput = direction === 'json-to-csv' ? JSON_EXAMPLE : CSV_EXAMPLE;
  const [input, setInput] = React.useState(defaultInput);
  const [protectFormulas, setProtectFormulas] = React.useState(true);

  const result = React.useMemo(() => {
    if (!input.trim()) return { ok: true as const, output: '' };
    if (direction === 'json-to-csv') {
      return jsonToCsv(input, { protectFormulas });
    }
    return csvToJson(input);
  }, [input, direction, protectFormulas]);

  return (
    <div className="space-y-4">
      <ToolActionsBar
        onLoadExample={() => setInput(defaultInput)}
        onClear={() => setInput('')}
        onReset={() => {
          setInput(defaultInput);
          setProtectFormulas(true);
        }}
        onUploadText={(text) => setInput(text)}
        acceptFiles={direction === 'json-to-csv' ? '.json,.txt' : '.csv,.txt'}
        outputText={result.ok ? result.output : ''}
        downloadFilename={direction === 'json-to-csv' ? 'export.csv' : 'export.json'}
        downloadMimeType={
          direction === 'json-to-csv'
            ? 'text/csv;charset=utf-8'
            : 'application/json;charset=utf-8'
        }
        extraActions={
          direction === 'json-to-csv' ? (
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[var(--border)] px-2.5 py-1 text-xs">
              <input
                type="checkbox"
                checked={protectFormulas}
                onChange={(e) => setProtectFormulas(e.target.checked)}
              />
              Formula-Safe CSV
            </label>
          ) : undefined
        }
      />

      {!result.ok && (
        <div className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-2 text-xs text-[#F87171]">
          {result.error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            {direction === 'json-to-csv' ? 'Input JSON' : 'Input CSV'}
          </span>
          <MonacoEditorWrapper
            value={input}
            onChange={setInput}
            language={direction === 'json-to-csv' ? 'json' : 'plaintext'}
          />
        </div>
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            {direction === 'json-to-csv' ? 'Output CSV' : 'Output JSON'}
          </span>
          <MonacoEditorWrapper
            value={result.ok ? result.output : ''}
            language={direction === 'json-to-csv' ? 'plaintext' : 'json'}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
