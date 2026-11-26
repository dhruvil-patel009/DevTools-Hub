'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Wrench } from 'lucide-react';

const LoadingPanel = () => (
  <div className="h-[420px] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--muted)]/30" />
);

const JsonTransformTool = dynamic(() => import('@/features/json-tools/components/JsonTransformTool').then((m) => m.JsonTransformTool), { loading: LoadingPanel });
const JsonDiffTool = dynamic(() => import('@/features/json-tools/components/JsonDiffTool').then((m) => m.JsonDiffTool), { loading: LoadingPanel });
const JsonTreeViewerTool = dynamic(() => import('@/features/json-tools/components/JsonExtendedSuite').then((m) => m.JsonTreeViewerTool), { loading: LoadingPanel });
const JsonToTsTool = dynamic(() => import('@/features/json-tools/components/JsonExtendedSuite').then((m) => m.JsonToTsTool), { loading: LoadingPanel });
const JsonSchemaValidatorTool = dynamic(() => import('@/features/json-tools/components/JsonExtendedSuite').then((m) => m.JsonSchemaValidatorTool), { loading: LoadingPanel });
const JsonPathTesterTool = dynamic(() => import('@/features/json-tools/components/JsonExtendedSuite').then((m) => m.JsonPathTesterTool), { loading: LoadingPanel });

const CodeFormatterTool = dynamic(() => import('@/features/code-tools/components/CodeFormatterTool').then((m) => m.CodeFormatterTool), { loading: LoadingPanel });
const CodeDiffCheckerTool = dynamic(() => import('@/features/code-tools/components/CodeExtendedSuite').then((m) => m.CodeDiffCheckerTool), { loading: LoadingPanel });
const CodeScreenshotTool = dynamic(() => import('@/features/code-tools/components/CodeExtendedSuite').then((m) => m.CodeScreenshotTool), { loading: LoadingPanel });
const HtmlCssJsPlaygroundTool = dynamic(() => import('@/features/code-tools/components/CodeExtendedSuite').then((m) => m.HtmlCssJsPlaygroundTool), { loading: LoadingPanel });

const CsvJsonConverterTool = dynamic(() => import('@/features/converters/components/CsvJsonConverterTool').then((m) => m.CsvJsonConverterTool), { loading: LoadingPanel });
const StructuredConverterTool = dynamic(() => import('@/features/converters/components/StructuredConverterTool').then((m) => m.StructuredConverterTool), { loading: LoadingPanel });
const TextEncodingTool = dynamic(() => import('@/features/converters/components/TextEncodingTool').then((m) => m.TextEncodingTool), { loading: LoadingPanel });

const CssGradientTool = dynamic(() => import('@/features/css-tools/components/CssGradientTool').then((m) => m.CssGradientTool), { loading: LoadingPanel });
const BoxShadowTool = dynamic(() => import('@/features/css-tools/components/CssExtendedSuite').then((m) => m.BoxShadowTool), { loading: LoadingPanel });
const BorderRadiusTool = dynamic(() => import('@/features/css-tools/components/CssExtendedSuite').then((m) => m.BorderRadiusTool), { loading: LoadingPanel });
const ColorConverterTool = dynamic(() => import('@/features/css-tools/components/CssExtendedSuite').then((m) => m.ColorConverterTool), { loading: LoadingPanel });
const ColorPaletteTool = dynamic(() => import('@/features/css-tools/components/CssExtendedSuite').then((m) => m.ColorPaletteTool), { loading: LoadingPanel });
const ColorContrastTool = dynamic(() => import('@/features/css-tools/components/CssExtendedSuite').then((m) => m.ColorContrastTool), { loading: LoadingPanel });
const FlexboxPlaygroundTool = dynamic(() => import('@/features/css-tools/components/CssExtendedSuite').then((m) => m.FlexboxPlaygroundTool), { loading: LoadingPanel });
const GridPlaygroundTool = dynamic(() => import('@/features/css-tools/components/CssExtendedSuite').then((m) => m.GridPlaygroundTool), { loading: LoadingPanel });

const UuidGeneratorTool = dynamic(() => import('@/features/generators/components/UuidGeneratorTool').then((m) => m.UuidGeneratorTool), { loading: LoadingPanel });
const SecurePasswordTool = dynamic(() => import('@/features/generators/components/GeneratorsExtendedSuite').then((m) => m.SecurePasswordTool), { loading: LoadingPanel });
const HashGeneratorTool = dynamic(() => import('@/features/generators/components/GeneratorsExtendedSuite').then((m) => m.HashGeneratorTool), { loading: LoadingPanel });
const LoremIpsumTool = dynamic(() => import('@/features/generators/components/GeneratorsExtendedSuite').then((m) => m.LoremIpsumTool), { loading: LoadingPanel });
const QrCodeTool = dynamic(() => import('@/features/generators/components/GeneratorsExtendedSuite').then((m) => m.QrCodeTool), { loading: LoadingPanel });
const UnixTimestampTool = dynamic(() => import('@/features/generators/components/GeneratorsExtendedSuite').then((m) => m.UnixTimestampTool), { loading: LoadingPanel });

const RegexTesterTool = dynamic(() => import('@/features/text-tools/components/RegexTesterTool').then((m) => m.RegexTesterTool), { loading: LoadingPanel });
const MarkdownEditorTool = dynamic(() => import('@/features/text-tools/components/TextExtendedSuite').then((m) => m.MarkdownEditorTool), { loading: LoadingPanel });
const TextCaseTool = dynamic(() => import('@/features/text-tools/components/TextExtendedSuite').then((m) => m.TextCaseTool), { loading: LoadingPanel });
const WordCounterTool = dynamic(() => import('@/features/text-tools/components/TextExtendedSuite').then((m) => m.WordCounterTool), { loading: LoadingPanel });
const TextDiffTool = dynamic(() => import('@/features/text-tools/components/TextExtendedSuite').then((m) => m.TextDiffTool), { loading: LoadingPanel });
const JwtDecoderTool = dynamic(() => import('@/features/text-tools/components/TextExtendedSuite').then((m) => m.JwtDecoderTool), { loading: LoadingPanel });

const HttpRequestTesterTool = dynamic(() => import('@/features/api-tools/components/ApiToolsSuite').then((m) => m.HttpRequestTesterTool), { loading: LoadingPanel });
const HttpStatusCodeTool = dynamic(() => import('@/features/api-tools/components/ApiToolsSuite').then((m) => m.HttpStatusCodeTool), { loading: LoadingPanel });
const HttpHeaderInspectorTool = dynamic(() => import('@/features/api-tools/components/ApiToolsSuite').then((m) => m.HttpHeaderInspectorTool), { loading: LoadingPanel });

const AiCodeAssistantTool = dynamic(() => import('@/features/ai-tools/components/AiCodeAssistantTool').then((m) => m.AiCodeAssistantTool), { loading: LoadingPanel });

const COMPONENT_MAP: Record<string, () => React.ReactNode> = {
  'json-formatter': () => <JsonTransformTool mode="format" />,
  'json-validator': () => <JsonTransformTool mode="validate" />,
  'json-minifier': () => <JsonTransformTool mode="minify" />,
  'json-diff-viewer': () => <JsonDiffTool />,
  'json-tree-viewer': () => <JsonTreeViewerTool />,
  'json-to-typescript': () => <JsonToTsTool />,
  'json-schema-validator': () => <JsonSchemaValidatorTool />,
  'json-path-tester': () => <JsonPathTesterTool />,
  'html-formatter': () => <CodeFormatterTool language="html" />,
  'css-formatter': () => <CodeFormatterTool language="css" />,
  'javascript-formatter': () => <CodeFormatterTool language="javascript" />,
  'typescript-formatter': () => <CodeFormatterTool language="typescript" />,
  'sql-formatter': () => <CodeFormatterTool language="sql" />,
  'code-diff-checker': () => <CodeDiffCheckerTool />,
  'code-screenshot-generator': () => <CodeScreenshotTool />,
  'html-css-js-playground': () => <HtmlCssJsPlaygroundTool />,
  'json-to-csv': () => <CsvJsonConverterTool direction="json-to-csv" />,
  'csv-to-json': () => <CsvJsonConverterTool direction="csv-to-json" />,
  'json-to-yaml': () => <StructuredConverterTool mode="json-to-yaml" />,
  'yaml-to-json': () => <StructuredConverterTool mode="yaml-to-json" />,
  'json-to-xml': () => <StructuredConverterTool mode="json-to-xml" />,
  'xml-to-json': () => <StructuredConverterTool mode="xml-to-json" />,
  'base64-encoder-decoder': () => <TextEncodingTool type="base64" />,
  'url-encoder-decoder': () => <TextEncodingTool type="url" />,
  'css-gradient-generator': () => <CssGradientTool />,
  'box-shadow-generator': () => <BoxShadowTool />,
  'border-radius-generator': () => <BorderRadiusTool />,
  'color-converter': () => <ColorConverterTool />,
  'color-palette-generator': () => <ColorPaletteTool />,
  'color-contrast-checker': () => <ColorContrastTool />,
  'css-flexbox-playground': () => <FlexboxPlaygroundTool />,
  'css-grid-playground': () => <GridPlaygroundTool />,
  'uuid-generator': () => <UuidGeneratorTool />,
  'secure-password-generator': () => <SecurePasswordTool />,
  'hash-generator': () => <HashGeneratorTool />,
  'lorem-ipsum-generator': () => <LoremIpsumTool />,
  'qr-code-generator': () => <QrCodeTool />,
  'unix-timestamp-converter': () => <UnixTimestampTool />,
  'regex-tester': () => <RegexTesterTool />,
  'markdown-editor': () => <MarkdownEditorTool />,
  'text-case-converter': () => <TextCaseTool />,
  'word-character-counter': () => <WordCounterTool />,
  'text-diff-checker': () => <TextDiffTool />,
  'jwt-decoder': () => <JwtDecoderTool />,
  'http-request-tester': () => <HttpRequestTesterTool />,
  'http-status-code-reference': () => <HttpStatusCodeTool />,
  'http-header-inspector': () => <HttpHeaderInspectorTool />,
  'ai-code-explainer': () => <AiCodeAssistantTool task="explain" />,
  'ai-code-reviewer': () => <AiCodeAssistantTool task="review" />,
  'ai-documentation-generator': () => <AiCodeAssistantTool task="documentation" />,
};

export function ToolRenderer({ componentKey }: { componentKey: string }) {
  const render = COMPONENT_MAP[componentKey];
  if (render) return <>{render()}</>;

  return (
    <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 p-10 text-center">
      <Wrench className="mx-auto mb-3 h-8 w-8 text-[#7C3AED]" />
      <p className="text-sm text-[var(--muted-foreground)]">Unknown tool component: {componentKey}</p>
    </div>
  );
}
