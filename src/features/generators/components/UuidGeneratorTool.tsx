'use client';

import * as React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolActionsBar } from '@/components/tools/ToolActionsBar';
import { generateUuidBatch } from '@/features/generators/logic';

export function UuidGeneratorTool() {
  const [count, setCount] = React.useState(5);
  const [uppercase, setUppercase] = React.useState(false);
  const [hyphens, setHyphens] = React.useState(true);
  const [uuids, setUuids] = React.useState<string[]>(() => generateUuidBatch(5));

  const regenerate = React.useCallback(
    (c = count, up = uppercase, hyp = hyphens) => {
      setUuids(generateUuidBatch(c, { uppercase: up, hyphens: hyp }));
    },
    [count, uppercase, hyphens]
  );

  const outputText = uuids.join('\n');

  return (
    <div className="space-y-4">
      <ToolActionsBar
        onClear={() => setUuids([])}
        onReset={() => {
          setCount(5);
          setUppercase(false);
          setHyphens(true);
          setUuids(generateUuidBatch(5));
        }}
        outputText={outputText}
        downloadFilename="uuids.txt"
        extraActions={
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs">
              Count:
              <input
                type="number"
                min={1}
                max={500}
                value={count}
                onChange={(e) => {
                  const val = Math.min(500, Math.max(1, Number(e.target.value) || 1));
                  setCount(val);
                  regenerate(val, uppercase, hyphens);
                }}
                className="h-8 w-20 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-xs"
              />
            </label>

            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[var(--border)] px-2.5 py-1 text-xs">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => {
                  setUppercase(e.target.checked);
                  regenerate(count, e.target.checked, hyphens);
                }}
              />
              Uppercase
            </label>

            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[var(--border)] px-2.5 py-1 text-xs">
              <input
                type="checkbox"
                checked={hyphens}
                onChange={(e) => {
                  setHyphens(e.target.checked);
                  regenerate(count, uppercase, e.target.checked);
                }}
              />
              Hyphens
            </label>

            <Button size="sm" variant="cyan" onClick={() => regenerate()}>
              <RefreshCw className="h-3.5 w-3.5" />
              Generate
            </Button>
          </div>
        }
      />

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <pre className="max-h-96 overflow-auto font-mono text-sm leading-7 text-[var(--foreground)]">
          {outputText || 'Click Generate to create UUID v4 values.'}
        </pre>
      </div>
    </div>
  );
}
