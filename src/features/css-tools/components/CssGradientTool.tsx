'use client';

import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolActionsBar } from '@/components/tools/ToolActionsBar';

interface ColorStop {
  id: string;
  color: string;
  position: number;
}

const DEFAULT_STOPS: ColorStop[] = [
  { id: '1', color: '#7C3AED', position: 0 },
  { id: '2', color: '#06B6D4', position: 100 },
];

export function CssGradientTool() {
  const [type, setType] = React.useState<'linear' | 'radial'>('linear');
  const [angle, setAngle] = React.useState(135);
  const [stops, setStops] = React.useState<ColorStop[]>(DEFAULT_STOPS);

  const cssValue = React.useMemo(() => {
    const stopList = [...stops]
      .sort((a, b) => a.position - b.position)
      .map((s) => `${s.color} ${s.position}%`)
      .join(', ');
    return type === 'linear'
      ? `linear-gradient(${angle}deg, ${stopList})`
      : `radial-gradient(circle, ${stopList})`;
  }, [type, angle, stops]);

  const cssCode = `background: ${cssValue};`;

  const addStop = () => {
    setStops((prev) => [
      ...prev,
      { id: String(Date.now()), color: '#22C55E', position: 50 },
    ]);
  };

  return (
    <div className="space-y-4">
      <ToolActionsBar
        onReset={() => {
          setType('linear');
          setAngle(135);
          setStops(DEFAULT_STOPS);
        }}
        outputText={cssCode}
        downloadFilename="gradient.css"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-xs font-medium">
              Type
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'linear' | 'radial')}
                className="ml-2 h-8 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-xs"
              >
                <option value="linear">Linear</option>
                <option value="radial">Radial</option>
              </select>
            </label>

            {type === 'linear' && (
              <label className="flex flex-1 items-center gap-3 text-xs font-medium">
                Angle: {angle}°
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={angle}
                  onChange={(e) => setAngle(Number(e.target.value))}
                  className="w-full accent-[#7C3AED]"
                />
              </label>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Color Stops
              </span>
              <Button size="sm" variant="outline" onClick={addStop}>
                <Plus className="h-3.5 w-3.5" />
                Add Stop
              </Button>
            </div>

            {stops.map((stop) => (
              <div key={stop.id} className="flex items-center gap-3">
                <input
                  type="color"
                  value={stop.color}
                  onChange={(e) =>
                    setStops((prev) =>
                      prev.map((s) => (s.id === stop.id ? { ...s, color: e.target.value } : s))
                    )
                  }
                  className="h-8 w-10 cursor-pointer rounded border border-[var(--border)] bg-transparent"
                  aria-label="Color picker"
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={stop.position}
                  onChange={(e) =>
                    setStops((prev) =>
                      prev.map((s) =>
                        s.id === stop.id ? { ...s, position: Number(e.target.value) } : s
                      )
                    )
                  }
                  className="flex-1 accent-[#06B6D4]"
                  aria-label="Stop position"
                />
                <span className="w-10 text-right font-mono text-xs">{stop.position}%</span>
                {stops.length > 2 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setStops((prev) => prev.filter((s) => s.id !== stop.id))}
                    aria-label="Remove color stop"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-[#EF4444]" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Generated CSS
            </span>
            <pre className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs">
              {cssCode}
            </pre>
          </div>
        </div>

        <div
          className="min-h-[320px] rounded-xl border border-[var(--border)] shadow-inner"
          style={{ background: cssValue }}
          aria-label="Live gradient preview"
        />
      </div>
    </div>
  );
}
