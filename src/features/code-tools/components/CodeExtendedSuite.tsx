'use client';

import * as React from 'react';
import { diffLines } from 'diff';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import { Camera } from 'lucide-react';
import { MonacoEditorWrapper } from '@/components/editors/MonacoEditorWrapper';
import { ToolActionsBar } from '@/components/tools/ToolActionsBar';
import { Button } from '@/components/ui/button';

export function CodeDiffCheckerTool() {
  const [left, setLeft] = React.useState('const sum = (a, b) => a + b;\nconsole.log(sum(1, 2));');
  const [right, setRight] = React.useState('const sum = (a: number, b: number) => a + b;\nconsole.log(sum(2, 3));');

  const diffs = React.useMemo(() => diffLines(left, right), [left, right]);

  return (
    <div className="space-y-4">
      <ToolActionsBar
        onClear={() => {
          setLeft('');
          setRight('');
        }}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <MonacoEditorWrapper value={left} onChange={setLeft} language="typescript" height="280px" minHeight="280px" />
        <MonacoEditorWrapper value={right} onChange={setRight} language="typescript" height="280px" minHeight="280px" />
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

export function CodeScreenshotTool() {
  const [code, setCode] = React.useState(
    `export function greet(name: string) {\n  return \`Hello, \${name}!\`;\n}`
  );
  const [title, setTitle] = React.useState('greet.ts');
  const captureRef = React.useRef<HTMLDivElement>(null);

  const exportPng = async () => {
    if (!captureRef.current) return;
    try {
      const dataUrl = await toPng(captureRef.current, { pixelRatio: 2 });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${title || 'snippet'}.png`;
      a.click();
      toast.success('Exported code screenshot PNG.');
    } catch {
      toast.error('Failed to render PNG.');
    }
  };

  return (
    <div className="space-y-4">
      <ToolActionsBar
        extraActions={
          <Button size="sm" onClick={exportPng}>
            <Camera className="h-3.5 w-3.5" />
            Export PNG
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Window title"
            className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-xs"
          />
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={12}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs"
          />
        </div>

        <div className="flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <div
            ref={captureRef}
            className="w-full rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] p-6 shadow-xl"
          >
            <div className="overflow-hidden rounded-lg bg-[#090E1A] p-4 text-[#F8FAFC] shadow-2xl">
              <div className="mb-3 flex items-center gap-2 border-b border-slate-800 pb-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
                <span className="ml-2 font-mono text-[11px] text-slate-400">{title}</span>
              </div>
              <pre className="overflow-x-auto font-mono text-xs leading-6">{code}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HtmlCssJsPlaygroundTool() {
  const [html, setHtml] = React.useState('<button id="btn">Click me</button>');
  const [css, setCss] = React.useState(
    'body { font-family: system-ui; padding: 16px; color: #f8fafc; background: #090e1a; }\nbutton { background: #7c3aed; color: #fff; border: 0; padding: 8px 14px; border-radius: 8px; cursor: pointer; }'
  );
  const [js, setJs] = React.useState(
    "document.getElementById('btn')?.addEventListener('click', () => { document.getElementById('btn').textContent = 'Clicked!'; });"
  );

  const srcDoc = React.useMemo(() => {
    const safeHtml = html;
    const safeCss = css.replace(/<\/style>/gi, '');
    const safeJs = js.replace(/<\/script>/gi, '');
    return `<!doctype html>
<html>
<head>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data: https:;">
<style>${safeCss}</style>
</head>
<body>${safeHtml}<script>${safeJs}</script></body>
</html>`;
  }, [html, css, js]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">HTML</span>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            rows={8}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2.5 font-mono text-xs"
          />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">CSS</span>
          <textarea
            value={css}
            onChange={(e) => setCss(e.target.value)}
            rows={8}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2.5 font-mono text-xs"
          />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">JavaScript</span>
          <textarea
            value={js}
            onChange={(e) => setJs(e.target.value)}
            rows={8}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2.5 font-mono text-xs"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <span className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
          Sandboxed Preview (allow-scripts only, no same-origin access)
        </span>
        <iframe
          title="Sandboxed HTML/CSS/JS Preview"
          sandbox="allow-scripts"
          srcDoc={srcDoc}
          className="h-72 w-full rounded-xl border border-[var(--border)] bg-[#090E1A]"
        />
      </div>
    </div>
  );
}
