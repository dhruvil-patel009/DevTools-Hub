'use client';

import * as React from 'react';
import { ToolActionsBar } from '@/components/tools/ToolActionsBar';
import { Badge } from '@/components/ui/badge';
import {
  generateHarmonyPalette,
  getContrastRatio,
  hexToRgb,
  rgbToHsl,
} from '@/features/css-tools/logic';

export function BoxShadowTool() {
  const [x, setX] = React.useState(0);
  const [y, setY] = React.useState(12);
  const [blur, setBlur] = React.useState(28);
  const [spread, setSpread] = React.useState(-4);
  const [color, setColor] = React.useState('#7c3aed');
  const [inset, setInset] = React.useState(false);

  const shadow = `${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px ${color}66`;
  const css = `box-shadow: ${shadow};`;

  return (
    <div className="space-y-4">
      <ToolActionsBar
        onReset={() => {
          setX(0);
          setY(12);
          setBlur(28);
          setSpread(-4);
          setColor('#7c3aed');
          setInset(false);
        }}
        outputText={css}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 text-xs">
          {[
            ['Offset X', x, setX, -50, 50],
            ['Offset Y', y, setY, -50, 50],
            ['Blur', blur, setBlur, 0, 100],
            ['Spread', spread, setSpread, -40, 40],
          ].map(([label, val, setter, min, max]) => (
            <label key={label as string} className="flex items-center justify-between gap-4">
              <span className="w-24">{label as string}: {val as number}px</span>
              <input
                type="range"
                min={min as number}
                max={max as number}
                value={val as number}
                onChange={(e) => (setter as (v: number) => void)(Number(e.target.value))}
                className="flex-1 accent-[#7C3AED]"
              />
            </label>
          ))}
          <div className="flex items-center gap-4 pt-2">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            <label className="inline-flex items-center gap-1.5">
              <input type="checkbox" checked={inset} onChange={(e) => setInset(e.target.checked)} />
              Inset
            </label>
          </div>
          <pre className="rounded-lg bg-[var(--background)] p-3 font-mono">{css}</pre>
        </div>
        <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] p-8">
          <div className="h-36 w-36 rounded-2xl bg-[var(--card)]" style={{ boxShadow: shadow }} />
        </div>
      </div>
    </div>
  );
}

export function BorderRadiusTool() {
  const [tl, setTl] = React.useState(16);
  const [tr, setTr] = React.useState(16);
  const [br, setBr] = React.useState(16);
  const [bl, setBl] = React.useState(16);
  const value = `${tl}px ${tr}px ${br}px ${bl}px`;
  const css = `border-radius: ${value};`;

  return (
    <div className="space-y-4">
      <ToolActionsBar
        onReset={() => {
          setTl(16);
          setTr(16);
          setBr(16);
          setBl(16);
        }}
        outputText={css}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 text-xs">
          {[
            ['Top Left', tl, setTl],
            ['Top Right', tr, setTr],
            ['Bottom Right', br, setBr],
            ['Bottom Left', bl, setBl],
          ].map(([label, val, setter]) => (
            <label key={label as string} className="flex items-center justify-between gap-4">
              <span className="w-28">{label as string}: {val as number}px</span>
              <input
                type="range"
                min={0}
                max={120}
                value={val as number}
                onChange={(e) => (setter as (v: number) => void)(Number(e.target.value))}
                className="flex-1 accent-[#06B6D4]"
              />
            </label>
          ))}
          <pre className="rounded-lg bg-[var(--background)] p-3 font-mono">{css}</pre>
        </div>
        <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)]">
          <div className="h-40 w-40 bg-[#7C3AED]" style={{ borderRadius: value }} />
        </div>
      </div>
    </div>
  );
}

export function ColorConverterTool() {
  const [hex, setHex] = React.useState('#7C3AED');
  const rgb = hexToRgb(hex);
  const hsl = rgb ? rgbToHsl(rgb) : null;
  const output = rgb && hsl ? `HEX: ${hex.toUpperCase()}\nRGB: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})\nHSL: hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : '';

  return (
    <div className="space-y-4">
      <ToolActionsBar outputText={output} />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex items-center gap-3">
            <input type="color" value={rgb ? hex : '#7C3AED'} onChange={(e) => setHex(e.target.value)} className="h-10 w-12" />
            <input
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="h-10 flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-sm"
            />
          </div>
          {output ? (
            <pre className="rounded-lg bg-[var(--background)] p-3 font-mono text-xs">{output}</pre>
          ) : (
            <p className="text-xs text-[#EF4444]">Enter a valid 3- or 6-digit HEX color.</p>
          )}
        </div>
        <div className="min-h-[180px] rounded-xl border border-[var(--border)]" style={{ backgroundColor: rgb ? hex : 'transparent' }} />
      </div>
    </div>
  );
}

export function ColorPaletteTool() {
  const [base, setBase] = React.useState('#7C3AED');
  const [mode, setMode] = React.useState<'complementary' | 'analogous' | 'triadic'>('analogous');
  const palette = generateHarmonyPalette(base, mode);

  return (
    <div className="space-y-4">
      <ToolActionsBar outputText={palette.join('\n')} />
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
        <input type="color" value={base} onChange={(e) => setBase(e.target.value)} className="h-9 w-12" />
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as typeof mode)}
          className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs"
        >
          <option value="analogous">Analogous</option>
          <option value="complementary">Complementary</option>
          <option value="triadic">Triadic</option>
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        {palette.map((c) => (
          <div key={c} className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div className="h-24" style={{ backgroundColor: c }} />
            <div className="p-3 font-mono text-xs">{c}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ColorContrastTool() {
  const [fg, setFg] = React.useState('#F8FAFC');
  const [bg, setBg] = React.useState('#090E1A');
  const ratio = getContrastRatio(fg, bg);

  return (
    <div className="space-y-4">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex items-center gap-3">
            <label className="text-xs">Foreground</label>
            <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} />
            <input value={fg} onChange={(e) => setFg(e.target.value)} className="h-8 rounded border border-[var(--border)] bg-[var(--background)] px-2 font-mono text-xs" />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs">Background</label>
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
            <input value={bg} onChange={(e) => setBg(e.target.value)} className="h-8 rounded border border-[var(--border)] bg-[var(--background)] px-2 font-mono text-xs" />
          </div>
          {ratio !== null && (
            <div className="space-y-2 pt-2">
              <p className="text-2xl font-bold">{ratio}:1</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant={ratio >= 4.5 ? 'success' : 'destructive'}>AA Normal (4.5:1)</Badge>
                <Badge variant={ratio >= 7 ? 'success' : 'destructive'}>AAA Normal (7:1)</Badge>
                <Badge variant={ratio >= 3 ? 'success' : 'destructive'}>AA Large (3:1)</Badge>
              </div>
            </div>
          )}
        </div>
        <div
          className="flex min-h-[200px] flex-col justify-center rounded-xl border border-[var(--border)] p-6"
          style={{ color: fg, backgroundColor: bg }}
        >
          <p className="text-xl font-bold">Sample Heading Text</p>
          <p className="mt-2 text-sm">The quick brown fox jumps over the lazy developer.</p>
        </div>
      </div>
    </div>
  );
}

export function FlexboxPlaygroundTool() {
  const [direction, setDirection] = React.useState<'row' | 'column'>('row');
  const [justify, setJustify] = React.useState('center');
  const [align, setAlign] = React.useState('center');
  const [gap, setGap] = React.useState(12);
  const css = `display: flex;\nflex-direction: ${direction};\njustify-content: ${justify};\nalign-items: ${align};\ngap: ${gap}px;`;

  return (
    <div className="space-y-4">
      <ToolActionsBar outputText={css} />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 text-xs">
          <select value={direction} onChange={(e) => setDirection(e.target.value as 'row' | 'column')} className="h-8 w-full rounded border border-[var(--border)] bg-[var(--background)] px-2">
            <option value="row">flex-direction: row</option>
            <option value="column">flex-direction: column</option>
          </select>
          <select value={justify} onChange={(e) => setJustify(e.target.value)} className="h-8 w-full rounded border border-[var(--border)] bg-[var(--background)] px-2">
            {['flex-start', 'center', 'flex-end', 'space-between', 'space-around'].map((v) => (
              <option key={v} value={v}>justify-content: {v}</option>
            ))}
          </select>
          <select value={align} onChange={(e) => setAlign(e.target.value)} className="h-8 w-full rounded border border-[var(--border)] bg-[var(--background)] px-2">
            {['stretch', 'flex-start', 'center', 'flex-end'].map((v) => (
              <option key={v} value={v}>align-items: {v}</option>
            ))}
          </select>
          <label className="flex items-center gap-3">
            Gap: {gap}px
            <input type="range" min={0} max={32} value={gap} onChange={(e) => setGap(Number(e.target.value))} className="flex-1" />
          </label>
          <pre className="rounded-lg bg-[var(--background)] p-3 font-mono">{css}</pre>
        </div>
        <div
          className="flex min-h-[260px] rounded-xl border border-[var(--border)] bg-[var(--background)] p-4"
          style={{ flexDirection: direction, justifyContent: justify, alignItems: align, gap }}
        >
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#7C3AED] font-bold text-white">
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GridPlaygroundTool() {
  const [cols, setCols] = React.useState(3);
  const [gap, setGap] = React.useState(12);
  const css = `display: grid;\ngrid-template-columns: repeat(${cols}, minmax(0, 1fr));\ngap: ${gap}px;`;

  return (
    <div className="space-y-4">
      <ToolActionsBar outputText={css} />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 text-xs">
          <label className="flex items-center gap-3">
            Columns: {cols}
            <input type="range" min={1} max={6} value={cols} onChange={(e) => setCols(Number(e.target.value))} className="flex-1" />
          </label>
          <label className="flex items-center gap-3">
            Gap: {gap}px
            <input type="range" min={0} max={32} value={gap} onChange={(e) => setGap(Number(e.target.value))} className="flex-1" />
          </label>
          <pre className="rounded-lg bg-[var(--background)] p-3 font-mono">{css}</pre>
        </div>
        <div
          className="grid min-h-[240px] rounded-xl border border-[var(--border)] bg-[var(--background)] p-4"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap }}
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="flex min-h-[56px] items-center justify-center rounded-lg bg-[#06B6D4]/20 border border-[#06B6D4]/40 font-mono text-sm font-bold text-[#22D3EE]">
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
