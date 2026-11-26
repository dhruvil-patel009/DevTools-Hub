'use client';

import * as React from 'react';
import { diffLines } from 'diff';
import { MonacoEditorWrapper } from '@/components/editors/MonacoEditorWrapper';
import { ToolActionsBar } from '@/components/tools/ToolActionsBar';
import { sortJsonKeys } from '@/features/json-tools/logic';

const LEFT_SAMPLE = `{\n  "name": "DevTools Hub",\n  "version": "1.0.0",\n  "env": "staging"\n}`;
const RIGHT_SAMPLE = `{\n  "env": "production",\n  "name": "DevTools Hub",\n  "version": "1.1.0",\n  "aiEnabled": true\n}`;

export function JsonDiffTool() {
  const [left, setLeft] = React.useState(LEFT_SAMPLE);
  const [right, setRight] = React.useState(RIGHT_SAMPLE);
  const [sortKeys, setSortKeys] = React.useState(true);

  const { diffs, error } = React.useMemo(() => {
    try {
      const leftObj = JSON.parse(left);
      const rightObj = JSON.parse(right);
      const leftStr = JSON.stringify(sortKeys ? sortJsonKeys(leftObj) : leftObj, null, 2);
      const rightStr = JSON.stringify(sortKeys ? sortJsonKeys(rightObj) : rightObj, null, 2);
      return { diffs: diffLines(leftStr, rightStr), error: '' };
    } catch (err) {
      return {
        diffs: [],
        error: err instanceof Error ? err.message : 'Both inputs must be valid JSON.',
      };
    }
  }, [left, right, sortKeys]);

  const diffSummary = diffs
    .map((part) => {
      const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
      return part.value
        .split('\n')
        .filter((line, idx, arr) => !(idx === arr.length - 1 && line === ''))
        .map((line) => `${prefix}${line}`)
        .join('\n');
    })
    .join('\n');

  return (
    <div className="space-y-4">
      <ToolActionsBar
        onLoadExample={() => {
          setLeft(LEFT_SAMPLE);
          setRight(RIGHT_SAMPLE);
        }}
        onClear={() => {
          setLeft('');
          setRight('');
        }}
        onReset={() => {
          setLeft(LEFT_SAMPLE);
          setRight(RIGHT_SAMPLE);
          setSortKeys(true);
        }}
        outputText={diffSummary}
        downloadFilename="json-diff.patch"
        extraActions={
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-[var(--border)] px-2.5 py-1 text-xs">
            <input
              type="checkbox"
              checked={sortKeys}
              onChange={(e) => setSortKeys(e.target.checked)}
            />
            Sort Keys
          </label>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Original JSON
          </span>
          <MonacoEditorWrapper value={left} onChange={setLeft} language="json" height="300px" minHeight="300px" />
        </div>
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Modified JSON
          </span>
          <MonacoEditorWrapper value={right} onChange={setRight} language="json" height="300px" minHeight="300px" />
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Diff Output
        </h3>
        {error ? (
          <p className="text-sm text-[#EF4444]">{error}</p>
        ) : (
          <pre className="max-h-80 overflow-auto rounded-lg bg-[var(--background)] p-3 font-mono text-xs leading-relaxed">
            {diffs.map((part, idx) => (
              <span
                key={idx}
                className={
                  part.added
                    ? 'block bg-[#22C55E]/15 text-[#4ADE80]'
                    : part.removed
                      ? 'block bg-[#EF4444]/15 text-[#F87171]'
                      : 'block text-[var(--muted-foreground)]'
                }
              >
                {part.value}
              </span>
            ))}
          </pre>
        )}
      </div>
    </div>
  );
}
