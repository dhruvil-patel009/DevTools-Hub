'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';

interface AdminDashboardData {
  totalUsers: number;
  activeUsers: number;
  totalExecutions: number;
  aiRequests: number;
  aiErrors: number;
  mostUsedTools: Array<{ name: string; slug: string; count: number }>;
  recentAuditLogs: Array<{
    id: string;
    action: string;
    entityType: string;
    createdAt: string;
    actor: { email: string; role: string };
  }>;
  health: { database: string; ai: string };
}

export default function AdminOverviewPage() {
  const [data, setData] = React.useState<AdminDashboardData | null>(null);

  React.useEffect(() => {
    fetch('/api/v1/admin/dashboard')
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setData(j.data);
      });
  }, []);

  if (!data) {
    return <p className="text-sm text-[var(--muted-foreground)]">Loading admin metrics...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs text-[var(--muted-foreground)]">Total Users</p>
          <p className="mt-1 text-2xl font-bold">{data.totalUsers}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs text-[var(--muted-foreground)]">Active Users</p>
          <p className="mt-1 text-2xl font-bold">{data.activeUsers}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs text-[var(--muted-foreground)]">Tool Executions</p>
          <p className="mt-1 text-2xl font-bold">{data.totalExecutions}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs text-[var(--muted-foreground)]">AI Requests</p>
          <p className="mt-1 text-2xl font-bold">{data.aiRequests}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs text-[var(--muted-foreground)]">System Health</p>
          <div className="mt-2 flex gap-1.5">
            <Badge variant={data.health.database === 'connected' ? 'success' : 'outline'}>
              DB: {data.health.database}
            </Badge>
            <Badge variant={data.health.ai === 'configured' ? 'cyan' : 'outline'}>
              AI: {data.health.ai}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="mb-3 text-base font-semibold">Most-Used Tools</h2>
          {data.mostUsedTools.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">No tool executions recorded yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {data.mostUsedTools.map((t) => (
                <li key={t.slug} className="flex justify-between border-b border-[var(--border)]/50 pb-1.5">
                  <span>{t.name}</span>
                  <span className="font-mono text-[#06B6D4]">{t.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="mb-3 text-base font-semibold">Recent Admin Activity</h2>
          {data.recentAuditLogs.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">No audit events recorded yet.</p>
          ) : (
            <ul className="space-y-2 text-xs">
              {data.recentAuditLogs.map((log) => (
                <li key={log.id} className="flex justify-between border-b border-[var(--border)]/50 pb-1.5">
                  <span className="font-mono">{log.action}</span>
                  <span className="text-[var(--muted-foreground)]">{log.actor.email}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
