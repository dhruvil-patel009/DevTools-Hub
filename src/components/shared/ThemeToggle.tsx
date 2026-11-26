'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme" disabled>
        <Moon className="h-4 w-4" />
      </Button>
    );
  }

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      title={`Theme: ${theme ?? 'dark'} (click to switch)`}
      aria-label={`Current theme ${theme ?? 'dark'}, click to switch`}
    >
      {theme === 'light' ? (
        <Sun className="h-4 w-4 text-amber-500" />
      ) : theme === 'system' ? (
        <Monitor className="h-4 w-4 text-[#06B6D4]" />
      ) : (
        <Moon className="h-4 w-4 text-[#A78BFA]" />
      )}
    </Button>
  );
}
