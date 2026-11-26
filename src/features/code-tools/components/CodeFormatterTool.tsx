'use client';

import * as React from 'react';
import type { SqlLanguage } from 'sql-formatter';
import { MonacoEditorWrapper } from '@/components/editors/MonacoEditorWrapper';
import { ToolActionsBar } from '@/components/tools/ToolActionsBar';
import { formatSql, formatWithPrettier } from '@/features/code-tools/logic';

type CodeLang = 'html' | 'css' | 'javascript' | 'typescript' | 'sql';

const EXAMPLES: Record<CodeLang, string> = {
  html: '<div class="card"><h2>DevTools Hub</h2><p>Fast &amp; private.</p></div>',
  css: '.btn{display:inline-flex;padding:8px 16px;background:#7c3aed;color:#fff;border-radius:8px;}',
  javascript: 'function greet(name){const msg=`Hello, ${name}!`;return msg.toUpperCase();}',
  typescript: 'export interface User{id:string;email:string;role:"USER"|"ADMIN";}const getRole=(u:User)=>u.role;',
  sql: 'select u.id,u.email,count(t.id) as runs from users u left join tool_usage t on t.user_id=u.id where u.status=\'ACTIVE\' group by u.id order by runs desc;',
};

export function CodeFormatterTool({ language }: { language: CodeLang }) {
  const [input, setInput] = React.useState(EXAMPLES[language]);
  const [output, setOutput] = React.useState('');
  const [error, setError] = React.useState('');
  const [tabWidth, setTabWidth] = React.useState<2 | 4>(2);
  const [sqlDialect, setSqlDialect] = React.useState<SqlLanguage>('postgresql');

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!input.trim()) {
        setOutput('');
        setError('');
        return;
      }
      if (language === 'sql') {
        const res = formatSql(input, sqlDialect, tabWidth);
        if (!cancelled) {
          if (res.ok) {
            setOutput(res.output);
            setError('');
          } else {
            setOutput('');
            setError(res.error);
          }
        }
        return;
      }

      const parser = language === 'javascript' ? 'babel' : language;
      const res = await formatWithPrettier(input, parser, tabWidth);
      if (!cancelled) {
        if (res.ok) {
          setOutput(res.output);
          setError('');
        } else {
          setOutput('');
          setError(res.error);
        }
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [input, language, tabWidth, sqlDialect]);

  const ext = language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language;

  return (
    <div className="space-y-4">
      <ToolActionsBar
        onLoadExample={() => setInput(EXAMPLES[language])}
        onClear={() => setInput('')}
        onReset={() => {
          setInput(EXAMPLES[language]);
          setTabWidth(2);
        }}
        onUploadText={(text) => setInput(text)}
        outputText={output}
        downloadFilename={`formatted.${ext}`}
        extraActions={
          <div className="flex items-center gap-2">
            <select
              aria-label="Tab width"
              value={tabWidth}
              onChange={(e) => setTabWidth(Number(e.target.value) as 2 | 4)}
              className="h-8 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-xs"
            >
              <option value={2}>2 Spaces</option>
              <option value={4}>4 Spaces</option>
            </select>

            {language === 'sql' && (
              <select
                aria-label="SQL dialect"
                value={sqlDialect}
                onChange={(e) => setSqlDialect(e.target.value as SqlLanguage)}
                className="h-8 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-xs"
              >
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
                <option value="sqlite">SQLite</option>
                <option value="sql">Standard SQL</option>
              </select>
            )}
          </div>
        }
      />

      {error && (
        <div className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-2 font-mono text-xs text-[#F87171]">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Input {language.toUpperCase()}
          </span>
          <MonacoEditorWrapper value={input} onChange={setInput} language={language} />
        </div>
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Formatted Output
          </span>
          <MonacoEditorWrapper value={output} language={language} readOnly />
        </div>
      </div>
    </div>
  );
}
