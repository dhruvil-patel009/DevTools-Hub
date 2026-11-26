'use client';

import * as React from 'react';
import QRCode from 'qrcode';
import { RefreshCw, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToolActionsBar } from '@/components/tools/ToolActionsBar';
import {
  computeShaHash,
  generateLoremIpsum,
  generateSecurePassword,
} from '@/features/generators/extended-logic';

export function SecurePasswordTool() {
  const [length, setLength] = React.useState(20);
  const [uppercase, setUppercase] = React.useState(true);
  const [lowercase, setLowercase] = React.useState(true);
  const [numbers, setNumbers] = React.useState(true);
  const [symbols, setSymbols] = React.useState(true);
  const [password, setPassword] = React.useState('');

  const regenerate = React.useCallback(() => {
    setPassword(generateSecurePassword({ length, uppercase, lowercase, numbers, symbols }));
  }, [length, uppercase, lowercase, numbers, symbols]);

  React.useEffect(() => {
    regenerate();
  }, [regenerate]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-lg border border-[#22C55E]/30 bg-[#22C55E]/10 px-3 py-2 text-xs text-[#4ADE80]">
        Generated locally using Web Crypto API (crypto.getRandomValues). Never transmitted or stored.
      </div>
      <ToolActionsBar
        outputText={password}
        extraActions={
          <Button size="sm" variant="cyan" onClick={regenerate}>
            <RefreshCw className="h-3.5 w-3.5" />
            Regenerate
          </Button>
        }
      />
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-4">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 font-mono text-lg break-all">
          {password || 'Select at least one character set.'}
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <label className="flex items-center gap-2">
            Length: {length}
            <input
              type="range"
              min={8}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
            />
          </label>
          {[
            ['Uppercase', uppercase, setUppercase],
            ['Lowercase', lowercase, setLowercase],
            ['Numbers', numbers, setNumbers],
            ['Symbols', symbols, setSymbols],
          ].map(([label, val, setter]) => (
            <label key={label as string} className="inline-flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={val as boolean}
                onChange={(e) => (setter as (v: boolean) => void)(e.target.checked)}
              />
              {label as string}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HashGeneratorTool() {
  const [input, setInput] = React.useState('DevTools Hub');
  const [algorithm, setAlgorithm] = React.useState<'SHA-256' | 'SHA-384' | 'SHA-512' | 'SHA-1'>('SHA-256');
  const [digest, setDigest] = React.useState('');

  React.useEffect(() => {
    let active = true;
    computeShaHash(input, algorithm).then((res) => {
      if (active) setDigest(res);
    });
    return () => {
      active = false;
    };
  }, [input, algorithm]);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Security note: General-purpose hashes (SHA-256, SHA-512) are fast by design and are NOT
          suitable for password storage. Use Argon2 or bcrypt for passwords.
        </span>
      </div>
      <ToolActionsBar
        onClear={() => setInput('')}
        outputText={digest}
        extraActions={
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as typeof algorithm)}
            className="h-8 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-xs"
          >
            <option value="SHA-256">SHA-256</option>
            <option value="SHA-384">SHA-384</option>
            <option value="SHA-512">SHA-512</option>
            <option value="SHA-1">SHA-1 (Legacy)</option>
          </select>
        }
      />
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={6}
        placeholder="Enter text to hash locally..."
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm"
      />
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 font-mono text-xs break-all">
        {digest}
      </div>
    </div>
  );
}

export function LoremIpsumTool() {
  const [unit, setUnit] = React.useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [count, setCount] = React.useState(3);
  const output = React.useMemo(() => generateLoremIpsum(unit, count), [unit, count]);

  return (
    <div className="space-y-4">
      <ToolActionsBar
        outputText={output}
        downloadFilename="lorem-ipsum.txt"
        extraActions={
          <div className="flex items-center gap-2 text-xs">
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as typeof unit)}
              className="h-8 rounded border border-[var(--border)] bg-[var(--background)] px-2"
            >
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
            </select>
            <input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Number(e.target.value) || 1)}
              className="h-8 w-20 rounded border border-[var(--border)] bg-[var(--background)] px-2"
            />
          </div>
        }
      />
      <div className="whitespace-pre-wrap rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 text-sm leading-7">
        {output}
      </div>
    </div>
  );
}

export function QrCodeTool() {
  const [text, setText] = React.useState('https://devtoolshub.local');
  const [dataUrl, setDataUrl] = React.useState('');

  React.useEffect(() => {
    if (!text.trim()) {
      setDataUrl('');
      return;
    }
    QRCode.toDataURL(text, { width: 280, margin: 2 }).then(setDataUrl).catch(() => setDataUrl(''));
  }, [text]);

  return (
    <div className="space-y-4">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter URL or text for QR code..."
      />
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-8">
        {dataUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dataUrl} alt="Generated QR Code" className="rounded-lg border border-[var(--border)] bg-white p-2" />
            <a
              href={dataUrl}
              download="qrcode.png"
              className="rounded-lg bg-[#7C3AED] px-4 py-2 text-xs font-medium text-white hover:bg-[#6D28D9]"
            >
              Download PNG
            </a>
          </>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">Enter text above to generate a QR code.</p>
        )}
      </div>
    </div>
  );
}

export function UnixTimestampTool() {
  const [epoch, setEpoch] = React.useState(() => String(Math.floor(Date.now() / 1000)));
  const numeric = Number(epoch);
  const ms = epoch.trim().length >= 13 ? numeric : numeric * 1000;
  const valid = Number.isFinite(ms) && epoch.trim() !== '';
  const dateObj = valid ? new Date(ms) : null;

  return (
    <div className="space-y-4">
      <ToolActionsBar
        extraActions={
          <Button size="sm" variant="cyan" onClick={() => setEpoch(String(Math.floor(Date.now() / 1000)))}>
            Current Timestamp
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-3">
          <label className="block text-xs font-medium">Unix Timestamp (seconds or ms)</label>
          <Input value={epoch} onChange={(e) => setEpoch(e.target.value)} className="font-mono" />
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-2 font-mono text-xs">
          {dateObj && !Number.isNaN(dateObj.getTime()) ? (
            <>
              <p>ISO-8601 (UTC): {dateObj.toISOString()}</p>
              <p>UTC String: {dateObj.toUTCString()}</p>
              <p>Local String: {dateObj.toLocaleString()}</p>
            </>
          ) : (
            <p className="text-[#EF4444]">Invalid timestamp.</p>
          )}
        </div>
      </div>
    </div>
  );
}
