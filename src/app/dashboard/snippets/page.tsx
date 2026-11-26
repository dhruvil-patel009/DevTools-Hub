'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Trash2, Copy, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Snippet {
  id: string;
  title: string;
  language: string;
  content: string;
  updatedAt: string;
}

export default function SnippetsPage() {
  const [snippets, setSnippets] = React.useState<Snippet[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [title, setTitle] = React.useState('');
  const [language, setLanguage] = React.useState('typescript');
  const [content, setContent] = React.useState('');

  const loadSnippets = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/user/snippets');
      const json = await res.json();
      if (json.success) setSnippets(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSnippets();
  }, [loadSnippets]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/v1/user/snippets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, language, content }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      toast.error(json?.error?.message || 'Failed to save snippet.');
      return;
    }
    toast.success('Snippet saved.');
    setTitle('');
    setContent('');
    loadSnippets();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/v1/user/snippets/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Snippet deleted.');
      setSnippets((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCreate}
        className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5"
      >
        <h2 className="text-base font-semibold">Save a New Code Snippet</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            required
            placeholder="Snippet title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            required
            placeholder="Language (e.g. typescript, sql, json)"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          />
        </div>
        <textarea
          required
          rows={5}
          placeholder="Paste non-sensitive code snippet..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs"
        />
        <Button type="submit" size="sm">
          <Plus className="h-4 w-4" />
          Save Snippet
        </Button>
      </form>

      {loading ? (
        <p className="text-sm text-[var(--muted-foreground)]">Loading snippets...</p>
      ) : snippets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--muted-foreground)]">
          No saved snippets yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {snippets.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <span className="font-mono text-xs text-[#06B6D4]">{s.language}</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(s.content);
                      toast.success('Copied snippet.');
                    }}
                    aria-label="Copy snippet"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(s.id)}
                    aria-label="Delete snippet"
                  >
                    <Trash2 className="h-4 w-4 text-[#EF4444]" />
                  </Button>
                </div>
              </div>
              <pre className="max-h-40 overflow-auto rounded-lg bg-[var(--background)] p-3 font-mono text-xs">
                {s.content}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
