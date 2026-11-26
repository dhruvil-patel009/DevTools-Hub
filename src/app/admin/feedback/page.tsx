'use client';

import * as React from 'react';
import { toast } from 'sonner';

interface FeedbackItem {
  id: string;
  category: string;
  message: string;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
}

export default function AdminFeedbackPage() {
  const [items, setItems] = React.useState<FeedbackItem[]>([]);

  const load = React.useCallback(async () => {
    const res = await fetch('/api/v1/admin/feedback');
    const json = await res.json();
    if (json.success) setItems(json.data);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id: string, status: FeedbackItem['status']) => {
    const res = await fetch(`/api/v1/admin/feedback/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success('Feedback status updated.');
      load();
    }
  };

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">No feedback submitted yet.</p>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:flex-row sm:items-center"
          >
            <div>
              <span className="font-mono text-xs uppercase text-[#06B6D4]">{item.category}</span>
              <p className="mt-1 text-sm">{item.message}</p>
            </div>
            <select
              value={item.status}
              onChange={(e) => updateStatus(item.id, e.target.value as FeedbackItem['status'])}
              className="h-8 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-xs"
            >
              <option value="OPEN">OPEN</option>
              <option value="IN_REVIEW">IN_REVIEW</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
        ))
      )}
    </div>
  );
}
