'use client';

import * as React from 'react';
import { MonacoEditorWrapper } from '@/components/editors/MonacoEditorWrapper';
import { ToolActionsBar } from '@/components/tools/ToolActionsBar';
import {
  jsonToXml,
  jsonToYaml,
  xmlToJson,
  yamlToJson,
} from '@/features/converters/extended-logic';

type Mode = 'json-to-yaml' | 'yaml-to-json' | 'json-to-xml' | 'xml-to-json';

const EXAMPLES: Record<Mode, string> = {
  'json-to-yaml': '{\n  "name": "devtools-hub",\n  "port": 3000,\n  "features": ["json", "yaml"]\n}',
  'yaml-to-json': 'name: devtools-hub\nport: 3000\nfeatures:\n  - json\n  - yaml',
  'json-to-xml': '{\n  "service": {\n    "name": "DevTools Hub",\n    "version": 1\n  }\n}',
  'xml-to-json': '<service>\n  <name>DevTools Hub</name>\n  <version>1</version>\n</service>',
};

export function StructuredConverterTool({ mode }: { mode: Mode }) {
  const [input, setInput] = React.useState(EXAMPLES[mode]);

  const result = React.useMemo(() => {
    if (!input.trim()) return { ok: true as const, output: '' };
    switch (mode) {
      case 'json-to-yaml':
        return jsonToYaml(input);
      case 'yaml-to-json':
        return yamlToJson(input);
      case 'json-to-xml':
        return jsonToXml(input);
      case 'xml-to-json':
        return xmlToJson(input);
    }
  }, [input, mode]);

  const inLang = mode.startsWith('json') ? 'json' : mode.startsWith('yaml') ? 'yaml' : 'xml';
  const outLang = mode.endsWith('json') ? 'json' : mode.endsWith('yaml') ? 'yaml' : 'xml';

  return (
    <div className="space-y-4">
      <ToolActionsBar
        onLoadExample={() => setInput(EXAMPLES[mode])}
        onClear={() => setInput('')}
        outputText={result.ok ? result.output : ''}
        downloadFilename={`converted.${outLang}`}
      />
      {!result.ok && (
        <div className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-2 text-xs text-[#F87171]">
          {result.error}
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <MonacoEditorWrapper value={input} onChange={setInput} language={inLang} />
        <MonacoEditorWrapper value={result.ok ? result.output : ''} language={outLang} readOnly />
      </div>
    </div>
  );
}
