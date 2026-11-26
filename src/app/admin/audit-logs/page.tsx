'use client';

import * as React from 'react';

interface AuditItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  actor: { email: string; role: string };
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = React.useState<AuditItem[]>([]);

  React.useEffect(() => {
    fetch('/api/v1/admin/audit-logs')
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setLogs(j.data);
      });
  }, []);

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-[var(--border)] uppercase text-[var(--muted-foreground)]">
          <tr>
            <th className="px-4 py-3">Timestamp</th>
            <th className="px-4 py-3">Actor</th>
            <th className="px-4 py-3">Action</th>
            <th className="px-4 py-3">Entity</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]/60">
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="px-4 py-3 font-mono">
                {new Date(log.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-3">{log.actor.email}</td>
              <td className="px-4 py-3 font-mono font-semibold text-[#06B6D4]">{log.action}</td>
              <td className="px-4 py-3 font-mono">
                {log.entityType}:{log.entityId.slice(0, 8)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
