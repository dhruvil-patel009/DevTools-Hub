'use client';

import * as React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface PopularTool {
  slug: string;
  name: string;
  executions: number;
}

interface AnalyticsSummary {
  last30DaysExecutions: number;
  successRate: number;
}

export default function AdminAnalyticsPage() {
  const [popular, setPopular] = React.useState<PopularTool[]>([]);
  const [summary, setSummary] = React.useState<AnalyticsSummary | null>(null);

  React.useEffect(() => {
    Promise.all([
      fetch('/api/v1/analytics/popular-tools').then((r) => r.json()),
      fetch('/api/v1/admin/analytics').then((r) => r.json()),
    ]).then(([popJson, sumJson]) => {
      if (popJson.success) setPopular(popJson.data);
      if (sumJson.success) setSummary(sumJson.data);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-xs text-[var(--muted-foreground)]">Last 30 Days Executions</p>
          <p className="mt-1 text-2xl font-bold">{summary?.last30DaysExecutions ?? 0}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-xs text-[var(--muted-foreground)]">Success Rate</p>
          <p className="mt-1 text-2xl font-bold text-[#22C55E]">{summary?.successRate ?? 100}%</p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="mb-4 text-base font-semibold">Top Executed Tools</h2>
        {popular.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            No execution telemetry recorded yet.
          </p>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popular}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip />
                <Bar dataKey="executions" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
