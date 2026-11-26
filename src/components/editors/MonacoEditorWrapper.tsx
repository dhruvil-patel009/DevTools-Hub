'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[320px] w-full animate-pulse items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 text-xs text-[var(--muted-foreground)]">
      Loading editor...
    </div>
  ),
});

export interface MonacoEditorWrapperProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string;
  minHeight?: string;
}

export function MonacoEditorWrapper({
  value,
  onChange,
  language = 'plaintext',
  readOnly = false,
  height = '420px',
  minHeight = '320px',
}: MonacoEditorWrapperProps) {
  const { resolvedTheme } = useTheme();
  const monacoTheme = resolvedTheme === 'light' ? 'light' : 'vs-dark';

  return (
    <div
      className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)]"
      style={{ minHeight }}
    >
      <MonacoEditor
        height={height}
        language={language}
        theme={monacoTheme}
        value={value}
        onChange={(val) => onChange?.(val ?? '')}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: 'var(--font-jetbrains-mono), monospace',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
          tabSize: 2,
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}
