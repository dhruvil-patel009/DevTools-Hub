'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface FeatureFlagItem {
  id: string;
  key: string;
  enabled: boolean;
  description: string;
}

export default function AdminSettingsPage() {
  const [flags, setFlags] = React.useState<FeatureFlagItem[]>([]);

  const load = React.useCallback(async () => {
    const res = await fetch('/api/v1/admin/feature-flags');
    const json = await res.json();
    if (json.success) setFlags(json.data);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const toggleFlag = async (flag: FeatureFlagItem) => {
    const res = await fetch(`/api/v1/admin/feature-flags/${flag.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !flag.enabled }),
    });
    if (res.ok) {
      toast.success(`Toggled ${flag.key}`);
      load();
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Feature Flags</h2>
      <div className="space-y-3">
        {flags.map((flag) => (
          <div
            key={flag.id}
            className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
          >
            <div>
              <p className="font-mono text-sm font-semibold">{flag.key}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{flag.description}</p>
            </div>
            <Button
              size="sm"
              variant={flag.enabled ? 'default' : 'outline'}
              onClick={() => toggleFlag(flag)}
            >
              {flag.enabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
