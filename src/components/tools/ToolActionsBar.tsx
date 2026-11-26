'use client';

import * as React from 'react';
import { Check, Copy, Download, RotateCcw, Sparkles, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export interface ToolActionsBarProps {
  onLoadExample?: () => void;
  onClear?: () => void;
  onReset?: () => void;
  outputText?: string;
  downloadFilename?: string;
  downloadMimeType?: string;
  onUploadText?: (content: string, filename: string) => void;
  acceptFiles?: string;
  extraActions?: React.ReactNode;
}

export function ToolActionsBar({
  onLoadExample,
  onClear,
  onReset,
  outputText,
  downloadFilename,
  downloadMimeType = 'text/plain;charset=utf-8',
  onUploadText,
  acceptFiles = '.json,.txt,.csv,.sql,.html,.css,.js,.ts,.xml,.yaml,.yml,.md',
  extraActions,
}: ToolActionsBarProps) {
  const [copied, setCopied] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleCopy = async () => {
    if (!outputText) {
      toast.info('Nothing to copy yet.');
      return;
    }
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      toast.success('Copied output to clipboard.');
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Clipboard access denied.');
    }
  };

  const handleDownload = () => {
    if (!outputText || !downloadFilename) return;
    const blob = new Blob([outputText], { type: downloadMimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFilename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${downloadFilename}`);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadText) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File exceeds 5 MB browser limit.');
      return;
    }
    const text = await file.text();
    onUploadText(text, file.name);
    toast.success(`Loaded ${file.name}`);
    e.target.value = '';
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-2.5">
      <div className="flex flex-wrap items-center gap-2">
        {onLoadExample && (
          <Button variant="secondary" size="sm" onClick={onLoadExample}>
            <Sparkles className="h-3.5 w-3.5 text-[#06B6D4]" />
            Example
          </Button>
        )}
        {onUploadText && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptFiles}
              onChange={handleFileChange}
              className="hidden"
              aria-label="Upload file"
            />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-3.5 w-3.5" />
              Upload
            </Button>
          </>
        )}
        {onClear && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
        {onReset && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        )}
        {extraActions}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {outputText !== undefined && (
          <Button variant="outline" size="sm" onClick={handleCopy} disabled={!outputText}>
            {copied ? (
              <Check className="h-3.5 w-3.5 text-[#22C55E]" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? 'Copied' : 'Copy Output'}
          </Button>
        )}
        {downloadFilename && outputText !== undefined && (
          <Button variant="default" size="sm" onClick={handleDownload} disabled={!outputText}>
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
        )}
      </div>
    </div>
  );
}
