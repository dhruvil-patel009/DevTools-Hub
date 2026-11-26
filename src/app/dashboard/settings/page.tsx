'use client';

import * as React from 'react';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { Download, Trash2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardSettingsPage() {
  const handleExport = async () => {
    const res = await fetch('/api/v1/user/export');
    const json = await res.json();
    if (!res.ok || !json.success) {
      toast.error('Failed to export data.');
      return;
    }
    const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'devtools-hub-export.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported your account data.');
  };

  const handleClearHistory = async () => {
    const res = await fetch('/api/v1/user/history', { method: 'DELETE' });
    if (res.ok) toast.success('Usage history cleared.');
    else toast.error('Failed to clear history.');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Permanently delete your account and all saved data? This cannot be undone.')) {
      return;
    }
    const res = await fetch('/api/v1/user/account', { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok || !json.success) {
      toast.error(json?.error?.message || 'Unable to delete account.');
      return;
    }
    toast.success('Account deleted.');
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-3">
        <h2 className="text-base font-semibold">Data & Privacy Controls</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export My Data (JSON)
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearHistory}>
            Clear Usage History
          </Button>
          <Button variant="secondary" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/5 p-5 space-y-3">
        <h2 className="text-base font-semibold text-[#F87171]">Danger Zone</h2>
        <p className="text-xs text-[var(--muted-foreground)]">
          Permanently delete your DevTools Hub account, saved snippets, and API collections.
        </p>
        <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
          <Trash2 className="h-4 w-4" />
          Delete Account
        </Button>
      </div>
    </div>
  );
}
