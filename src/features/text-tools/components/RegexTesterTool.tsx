'use client';

import * as React from 'react';
import { ToolActionsBar } from '@/components/tools/ToolActionsBar';
import { Input } from '@/components/ui/input';
import type { RegexMatchItem, RegexWorkerResponse } from '@/workers/regex.worker';

const EXAMPLE_PATTERN = String.raw`\b([a-z0-9._%+-]+)@([a-z0-9.-]+\.[a-z]{2,})\b`;
const EXAMPLE_TEXT = `Contact support@devtoolshub.dev or admin@example.org for details.\nInvalid: user@localhost`;

export function RegexTesterTool() {
  const [pattern, setPattern] = React.useState(EXAMPLE_PATTERN);
  const [flags, setFlags] = React.useState('gi');
  const [text, setText] = React.useState(EXAMPLE_TEXT);
  const [matches, setMatches] = React.useState<RegexMatchItem[]>([]);
  const [error, setError] = React.useState('');
  const [running, setRunning] = React.useState(false);

  const workerRef = React.useRef<Worker | null>(null);
  const reqIdRef = React.useRef(0);

  const spawnWorker = React.useCallback(() => {
    workerRef.current?.terminate();
    const w = new Worker(new URL('@/workers/regex.worker.ts', import.meta.url));
    workerRef.current = w;
    return w;
  }, []);

  React.useEffect(() => {
    const worker = spawnWorker();
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [spawnWorker]);

  React.useEffect(() => {
    const id = ++reqIdRef.current;
    setRunning(true);
    setError('');

    let worker = workerRef.current;
    if (!worker) {
      worker = spawnWorker();
    }

    const timeout = window.setTimeout(() => {
      if (reqIdRef.current === id) {
        // ReDoS protection: terminate hung worker and respawn cleanly
        spawnWorker();
        setMatches([]);
        setError('Regex execution timed out (1500ms limit) to protect browser responsiveness.');
        setRunning(false);
      }
    }, 1500);

    worker.onmessage = (event: MessageEvent<RegexWorkerResponse>) => {
      if (event.data.id !== id) return;
      window.clearTimeout(timeout);
      setRunning(false);
      if (event.data.ok) {
        setMatches(event.data.matches ?? []);
        setError('');
      } else {
        setMatches([]);
        setError(event.data.error ?? 'Invalid regular expression.');
      }
    };

    worker.postMessage({ id, pattern, flags, text });

    return () => {
      window.clearTimeout(timeout);
    };
  }, [pattern, flags, text, spawnWorker]);

  const toggleFlag = (flag: string) => {
    setFlags((prev) => (prev.includes(flag) ? prev.replace(flag, '') : prev + flag));
  };

  const outputSummary = matches
    .map((m, i) => `#${i + 1} [${m.index}]: ${m.match}${m.groups.length ? ` | groups: ${JSON.stringify(m.groups)}` : ''}`)
    .join('\n');

  return (
    <div className="space-y-4">
      <ToolActionsBar
        onLoadExample={() => {
          setPattern(EXAMPLE_PATTERN);
          setFlags('gi');
          setText(EXAMPLE_TEXT);
        }}
        onClear={() => {
          setPattern('');
          setText('');
        }}
        onReset={() => {
          setPattern(EXAMPLE_PATTERN);
          setFlags('gi');
          setText(EXAMPLE_TEXT);
        }}
        outputText={outputSummary}
        downloadFilename="regex-matches.txt"
      />

      <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <label htmlFor="regex-pattern" className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
            Regular Expression Pattern
          </label>
          <Input
            id="regex-pattern"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="font-mono"
            placeholder="Enter regex pattern..."
          />
        </div>
        <div>
          <span className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Flags</span>
          <div className="flex gap-1.5">
            {['g', 'i', 'm', 's', 'u'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => toggleFlag(f)}
                className={`h-9 w-9 rounded-lg border font-mono text-xs font-semibold transition-colors cursor-pointer ${
                  flags.includes(f)
                    ? 'border-[#7C3AED] bg-[#7C3AED]/20 text-[#A78BFA]'
                    : 'border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-2 text-xs text-[#F87171]">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="regex-test-text"
            className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]"
          >
            Test String
          </label>
          <textarea
            id="regex-test-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            <span>Matches ({matches.length})</span>
            {running && <span className="text-[#06B6D4]">Evaluating in worker...</span>}
          </div>
          <div className="max-h-[300px] min-h-[280px] space-y-2 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
            {matches.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">No matches found.</p>
            ) : (
              matches.map((m, idx) => (
                <div
                  key={`${m.index}-${idx}`}
                  className="rounded-md border border-[var(--border)]/70 bg-[var(--background)] p-2.5 font-mono text-xs"
                >
                  <div className="flex items-center justify-between text-[var(--muted-foreground)]">
                    <span>Match #{idx + 1}</span>
                    <span>Index {m.index}</span>
                  </div>
                  <p className="mt-1 break-all font-semibold text-[#22C55E]">{m.match}</p>
                  {m.groups.length > 0 && (
                    <p className="mt-1 text-[var(--muted-foreground)]">
                      Groups: {JSON.stringify(m.groups)}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
