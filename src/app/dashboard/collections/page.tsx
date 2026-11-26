'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ApiCollectionItem {
  id: string;
  name: string;
  description?: string | null;
  requests: Array<{ id: string; name: string; method: string; url: string }>;
}

export default function CollectionsPage() {
  const [collections, setCollections] = React.useState<ApiCollectionItem[]>([]);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');

  const load = React.useCallback(async () => {
    const res = await fetch('/api/v1/user/collections');
    const json = await res.json();
    if (json.success) setCollections(json.data);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/v1/user/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      toast.error(json?.error?.message || 'Failed to create collection.');
      return;
    }
    toast.success('Collection created.');
    setName('');
    setDescription('');
    load();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/v1/user/collections/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Collection deleted.');
      setCollections((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5"
      >
        <h2 className="text-base font-semibold">Create API Collection</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            required
            placeholder="Collection name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Optional description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <Button type="submit" size="sm">
          <Plus className="h-4 w-4" />
          Create Collection
        </Button>
      </form>

      {collections.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted-foreground)]">
          No API collections saved yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {collections.map((c) => (
            <div key={c.id} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{c.name}</h3>
                  {c.description && (
                    <p className="text-xs text-[var(--muted-foreground)]">{c.description}</p>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(c.id)}
                  aria-label="Delete collection"
                >
                  <Trash2 className="h-4 w-4 text-[#EF4444]" />
                </Button>
              </div>
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                {c.requests.length} saved request(s) (credentials excluded)
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
