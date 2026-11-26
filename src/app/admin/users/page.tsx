'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [q, setQ] = React.useState('');

  const load = React.useCallback(async () => {
    const res = await fetch(`/api/v1/admin/users?q=${encodeURIComponent(q)}`);
    const json = await res.json();
    if (json.success) setUsers(json.data);
  }, [q]);

  React.useEffect(() => {
    load();
  }, [load]);

  const updateUser = async (id: string, payload: Record<string, string>) => {
    const res = await fetch(`/api/v1/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      toast.error(json?.error?.message || 'Action denied.');
      return;
    }
    toast.success('User updated.');
    load();
  };

  return (
    <div className="space-y-4">
      <div className="max-w-sm">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search users by email or name..."
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted-foreground)]">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/60">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3 font-mono text-xs">{u.role}</td>
                <td className="px-4 py-3 font-mono text-xs">{u.status}</td>
                <td className="px-4 py-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateUser(u.id, {
                        status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                      })
                    }
                  >
                    {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
