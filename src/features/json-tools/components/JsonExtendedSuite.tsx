'use client';

import * as React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { MonacoEditorWrapper } from '@/components/editors/MonacoEditorWrapper';
import { ToolActionsBar } from '@/components/tools/ToolActionsBar';
import { Input } from '@/components/ui/input';
import {
  evaluateJsonPath,
  jsonToTypeScript,
  validateJsonSchema,
} from '@/features/json-tools/extended-logic';

const SAMPLE_JSON = `{
  "service": "DevTools Hub",
  "active": true,
  "users": [
    { "id": 1, "name": "Ada", "role": "ADMIN" },
    { "id": 2, "name": "Linus", "role": "USER" }
  ]
}`;

function TreeNode({ name, value }: { name: string; value: unknown }) {
  const [open, setOpen] = React.useState(true);
  const isObj = value !== null && typeof value === 'object';

  if (!isObj) {
    return (
      <div className="pl-4 font-mono text-xs leading-6">
        <span className="text-[#A78BFA]">{name}: </span>
        <span className="text-[#22C55E]">{JSON.stringify(value)}</span>
      </div>
    );
  }

  const entries = Array.isArray(value)
    ? value.map((v, i) => [String(i), v] as const)
    : Object.entries(value as Record<string, unknown>);

  return (
    <div className="pl-3 font-mono text-xs">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 py-0.5 text-[var(--foreground)] hover:text-[#06B6D4] cursor-pointer"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        <span className="font-semibold">{name}</span>
        <span className="text-[var(--muted-foreground)]">
          {Array.isArray(value) ? `[${entries.length}]` : `{${entries.length}}`}
        </span>
      </button>
      {open && (
        <div className="border-l border-[var(--border)] pl-2">
          {entries.map(([k, v]) => (
            <TreeNode key={k} name={k} value={v} />
          ))}
        </div>
      )}
    </div>
  );
}

export function JsonTreeViewerTool() {
  const [input, setInput] = React.useState(SAMPLE_JSON);
  const parsed = React.useMemo(() => {
    try {
      return { ok: true as const, data: JSON.parse(input) };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : 'Invalid JSON' };
    }
  }, [input]);

  return (
    <div className="space-y-4">
      <ToolActionsBar
        onLoadExample={() => setInput(SAMPLE_JSON)}
        onClear={() => setInput('')}
        onReset={() => setInput(SAMPLE_JSON)}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <MonacoEditorWrapper value={input} onChange={setInput} language="json" />
        <div className="max-h-[420px] overflow-auto rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          {parsed.ok ? (
            <TreeNode name="root" value={parsed.data} />
          ) : (
            <p className="text-xs text-[#EF4444]">{parsed.error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function JsonToTsTool() {
  const [input, setInput] = React.useState(SAMPLE_JSON);
  const [rootName, setRootName] = React.useState('DevToolsConfig');
  const res = React.useMemo(() => jsonToTypeScript(input, rootName || 'Root'), [input, rootName]);

  return (
    <div className="space-y-4">
      <ToolActionsBar
        onLoadExample={() => setInput(SAMPLE_JSON)}
        onClear={() => setInput('')}
        outputText={res.ok ? res.output : ''}
        downloadFilename="types.ts"
        extraActions={
          <Input
            value={rootName}
            onChange={(e) => setRootName(e.target.value)}
            placeholder="Root interface name"
            className="h-8 w-44 text-xs"
          />
        }
      />
      {!res.ok && <p className="text-xs text-[#EF4444]">{res.error}</p>}
      <div className="grid gap-4 lg:grid-cols-2">
        <MonacoEditorWrapper value={input} onChange={setInput} language="json" />
        <MonacoEditorWrapper value={res.ok ? res.output : ''} language="typescript" readOnly />
      </div>
    </div>
  );
}

const DEFAULT_SCHEMA = `{
  "type": "object",
  "required": ["service", "active"],
  "properties": {
    "service": { "type": "string" },
    "active": { "type": "boolean" }
  }
}`;

export function JsonSchemaValidatorTool() {
  const [jsonInput, setJsonInput] = React.useState(SAMPLE_JSON);
  const [schemaInput, setSchemaInput] = React.useState(DEFAULT_SCHEMA);

  const result = React.useMemo(
    () => validateJsonSchema(jsonInput, schemaInput),
    [jsonInput, schemaInput]
  );

  return (
    <div className="space-y-4">
      <ToolActionsBar
        onReset={() => {
          setJsonInput(SAMPLE_JSON);
          setSchemaInput(DEFAULT_SCHEMA);
        }}
      />
      <div
        className={`rounded-lg border px-3 py-2 text-xs font-medium ${
          result.valid
            ? 'border-[#22C55E]/30 bg-[#22C55E]/10 text-[#4ADE80]'
            : 'border-[#EF4444]/30 bg-[#EF4444]/10 text-[#F87171]'
        }`}
      >
        {result.valid ? 'JSON matches schema.' : result.errors.join(' | ')}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
            JSON Document
          </span>
          <MonacoEditorWrapper value={jsonInput} onChange={setJsonInput} language="json" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
            JSON Schema
          </span>
          <MonacoEditorWrapper value={schemaInput} onChange={setSchemaInput} language="json" />
        </div>
      </div>
    </div>
  );
}

export function JsonPathTesterTool() {
  const [jsonInput, setJsonInput] = React.useState(SAMPLE_JSON);
  const [expr, setExpr] = React.useState('$.users[*].name');
  const res = React.useMemo(() => evaluateJsonPath(jsonInput, expr), [jsonInput, expr]);

  return (
    <div className="space-y-4">
      <ToolActionsBar
        onReset={() => {
          setJsonInput(SAMPLE_JSON);
          setExpr('$.users[*].name');
        }}
        outputText={res.ok ? res.output : ''}
      />
      <Input
        value={expr}
        onChange={(e) => setExpr(e.target.value)}
        placeholder="JSONPath expression (e.g. $.users[*].name)"
        className="font-mono"
      />
      {!res.ok && <p className="text-xs text-[#EF4444]">{res.error}</p>}
      <div className="grid gap-4 lg:grid-cols-2">
        <MonacoEditorWrapper value={jsonInput} onChange={setJsonInput} language="json" />
        <MonacoEditorWrapper value={res.ok ? res.output : ''} language="json" readOnly />
      </div>
    </div>
  );
}
