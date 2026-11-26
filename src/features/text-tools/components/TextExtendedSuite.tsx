'use client';

import * as React from 'react';
import { diffLines } from 'diff';
import { ShieldAlert } from 'lucide-react';
import { ToolActionsBar } from '@/components/tools/ToolActionsBar';
import { Button } from '@/components/ui/button';
import {
  convertTextCase,
  countTextStats,
  decodeJwtUnsafe,
  sanitizeMarkdownHtml,
} from '@/features/text-tools/logic';

export function MarkdownEditorTool() {
  const [md, setMd] = React.useState(
    '# DevTools Hub\n\nWrite **sanitized** Markdown here.\n\n```ts\nconst safe = true;\n```'
  );
  const html = React.useMemo(() => sanitizeMarkdownHtml(md), [md]);

  return (
    <div className="space-y-4">
      <ToolActionsBar
        onClear={() => setMd('')}
        outputText={html}
        downloadFilename="preview.html"
        downloadMimeType="text/html;charset=utf-8"
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <textarea
          value={md}
          onChange={(e) => setMd(e.target.value)}
          rows={16}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 font-mono text-sm"
        />
        <div
          className="prose prose-invert max-w-none overflow-auto rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 text-sm"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}

export function TextCaseTool() {
  const [input, setInput] = React.useState('devtools hub api_response_handler');
  const [output, setOutput] = React.useState(() => convertTextCase('devtools hub api_response_handler', 'camel'));

  const cases: Array<[string, Parameters<typeof convertTextCase>[1]]> = [
    ['camelCase', 'camel'],
    ['PascalCase', 'pascal'],
    ['snake_case', 'snake'],
    ['kebab-case', 'kebab'],
    ['CONSTANT_CASE', 'constant'],
    ['Title Case', 'title'],
    ['UPPERCASE', 'upper'],
    ['lowercase', 'lower'],
  ];

  return (
    <div className="space-y-4">
      <ToolActionsBar onClear={() => { setInput(''); setOutput(''); }} outputText={output} />
      <div className="flex flex-wrap gap-2">
        {cases.map(([label, target]) => (
          <Button
            key={target}
            size="sm"
            variant="outline"
            onClick={() => setOutput(convertTextCase(input, target))}
          >
            {label}
          </Button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm"
        />
        <textarea
          readOnly
          value={output}
          rows={8}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 font-mono text-sm"
        />
      </div>
    </div>
  );
}

export function WordCounterTool() {
  const [text, setText] = React.useState('Everything developers need. One workspace.');
  const stats = React.useMemo(() => countTextStats(text), [text]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {[
          ['Words', stats.words],
          ['Characters', stats.characters],
          ['No Spaces', stats.charactersNoSpaces],
          ['Lines', stats.lines],
          ['Sentences', stats.sentences],
          ['UTF-8 Bytes', stats.bytes],
          ['Read (min)', stats.readingMinutes],
        ].map(([label, val]) => (
          <div key={label as string} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
            <p className="text-[11px] text-[var(--muted-foreground)]">{label as string}</p>
            <p className="mt-1 text-xl font-bold">{val as number}</p>
          </div>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 text-sm"
      />
    </div>
  );
}

export function TextDiffTool() {
  const [left, setLeft] = React.useState('Line one\nLine two\nLine three');
  const [right, setRight] = React.useState('Line one\nLine 2 updated\nLine three\nLine four');
  const diffs = React.useMemo(() => diffLines(left, right), [left, right]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <textarea
          value={left}
          onChange={(e) => setLeft(e.target.value)}
          rows={8}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs"
        />
        <textarea
          value={right}
          onChange={(e) => setRight(e.target.value)}
          rows={8}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs"
        />
      </div>
      <pre className="max-h-80 overflow-auto rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 font-mono text-xs">
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
    </div>
  );
}

export function JwtDecoderTool() {
  const [token, setToken] = React.useState('');
  const decoded = React.useMemo(() => (token.trim() ? decodeJwtUnsafe(token) : null), [token]);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Decoding only — NOT cryptographic signature verification. Tokens are decoded locally in
          memory and are never persisted or transmitted.
        </span>
      </div>

      <textarea
        value={token}
        onChange={(e) => setToken(e.target.value)}
        rows={4}
        placeholder="Paste JWT (header.payload.signature)..."
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs"
      />

      {decoded && !decoded.ok && (
        <p className="text-xs text-[#EF4444]">{decoded.error}</p>
      )}

      {decoded && decoded.ok && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase text-[#A78BFA]">Header</h3>
            <pre className="overflow-auto font-mono text-xs">
              {JSON.stringify(decoded.header, null, 2)}
            </pre>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase text-[#06B6D4]">Payload Claims</h3>
            <pre className="overflow-auto font-mono text-xs">
              {JSON.stringify(decoded.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
