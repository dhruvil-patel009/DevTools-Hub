'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface AdminTool {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  category: { name: string };
}

export default function AdminToolsPage() {
  const [tools, setTools] = React.useState<AdminTool[]>([]);

  const load = React.useCallback(async () => {
    const res = await fetch('/api/v1/admin/tools');
    const json = await res.json();
    if (json.success) setTools(json.data);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const toggleField = async (tool: AdminTool, field: 'isActive' | 'isFeatured') => {
    const res = await fetch(`/api/v1/admin/tools/${tool.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: !tool[field] }),
    });
    if (res.ok) {
      toast.success(`Updated ${tool.name}`);
      load();
    } else {
      toast.error('Failed to update tool.');
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted-foreground)]">
          <tr>
            <th className="px-4 py-3">Tool</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Active</th>
            <th className="px-4 py-3">Featured</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]/60">
          {tools.map((tool) => (
            <tr key={tool.id}>
              <td className="px-4 py-3 font-medium">{tool.name}</td>
              <td className="px-4 py-3 text-[var(--muted-foreground)]">{tool.category.name}</td>
              <td className="px-4 py-3">
                <Button
                  size="sm"
                  variant={tool.isActive ? 'default' : 'outline'}
                  onClick={() => toggleField(tool, 'isActive')}
                >
                  {tool.isActive ? 'Enabled' : 'Disabled'}
                </Button>
              </td>
              <td className="px-4 py-3">
                <Button
                  size="sm"
                  variant={tool.isFeatured ? 'cyan' : 'outline'}
                  onClick={() => toggleField(tool, 'isFeatured')}
                >
                  {tool.isFeatured ? 'Featured' : 'Standard'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
