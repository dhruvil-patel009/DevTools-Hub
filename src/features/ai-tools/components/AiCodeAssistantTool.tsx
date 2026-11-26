'use client';

import * as React from 'react';
import { Bot, ShieldAlert, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { MonacoEditorWrapper } from '@/components/editors/MonacoEditorWrapper';
import { ToolActionsBar } from '@/components/tools/ToolActionsBar';

export function AiCodeAssistantTool({
  task,
}: {
  task: 'explain' | 'review' | 'documentation';
}) {
  const [language, setLanguage] = React.useState('typescript');
  const [code, setCode] = React.useState(
    'export function debounce<T extends (...args: unknown[]) => void>(fn: T, delayMs: number) {\n  let timer: ReturnType<typeof setTimeout>;\n  return (...args: Parameters<T>) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delayMs);\n  };\n}'
  );
  const [consent, setConsent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [output, setOutput] = React.useState('');
  const [error, setError] = React.useState('');
  const abortRef = React.useRef<AbortController | null>(null);

  const endpoint = `/api/v1/ai/${task}`;

  const runAi = async () => {
    if (!consent) {
      toast.error('Please confirm consent before sending code to the AI provider.');
      return;
    }
    setError('');
    setOutput('');
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code, consentConfirmed: true }),
        signal: controller.signal,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json?.error?.message || 'AI request failed.');
      } else {
        setOutput(json.data.output);
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        setError('AI request cancelled.');
      } else {
        setError('Network error while contacting AI endpoint.');
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Privacy warning: Do NOT submit passwords, API keys, private keys, or confidential company
          code. Requires sign-in and server-configured Gemini API key.
        </span>
      </div>

      <ToolActionsBar
        onClear={() => {
          setCode('');
          setOutput('');
        }}
        outputText={output}
        downloadFilename={`ai-${task}.md`}
        extraActions={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="h-8 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-xs"
            >
              {['typescript', 'javascript', 'python', 'go', 'rust', 'java', 'sql'].map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>

            {loading ? (
              <Button size="sm" variant="destructive" onClick={() => abortRef.current?.abort()}>
                <XCircle className="h-3.5 w-3.5" />
                Cancel
              </Button>
            ) : (
              <Button size="sm" onClick={runAi} disabled={!consent || !code.trim()}>
                <Bot className="h-3.5 w-3.5" />
                Run AI {task}
              </Button>
            )}
          </div>
        }
      />

      <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-[var(--muted-foreground)]">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        I confirm this code contains no secrets or confidential data and consent to sending it to the configured AI provider.
      </label>

      {error && (
        <div className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 p-3 text-xs text-[#F87171]">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <MonacoEditorWrapper value={code} onChange={setCode} language={language} />
        <div className="max-h-[420px] min-h-[320px] overflow-auto whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 text-sm">
          {output || 'AI response will appear here.'}
        </div>
      </div>
    </div>
  );
}
