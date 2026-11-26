'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function FeedbackForm() {
  const [category, setCategory] = React.useState('general');
  const [message, setMessage] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 5) {
      toast.error('Please enter at least 5 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, message }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        toast.error(json?.error?.message || 'Unable to submit feedback.');
      } else {
        toast.success('Feedback submitted. Thank you!');
        setMessage('');
      }
    } catch {
      toast.error('Network error while submitting feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6"
    >
      <div>
        <label htmlFor="fb-category" className="mb-1.5 block text-sm font-medium">
          Category
        </label>
        <select
          id="fb-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
        >
          <option value="general">General Feedback</option>
          <option value="bug">Bug Report</option>
          <option value="feature">Feature Request</option>
        </select>
      </div>

      <div>
        <label htmlFor="fb-message" className="mb-1.5 block text-sm font-medium">
          Message
        </label>
        <textarea
          id="fb-message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your feedback or issue..."
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        />
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Feedback'}
      </Button>
    </form>
  );
}
