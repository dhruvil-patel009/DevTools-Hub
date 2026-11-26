'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  ChevronRight,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { TOOL_CATEGORIES } from '@/lib/tool-registry/categories';
import { getAllTools, getFeaturedTools } from '@/lib/tool-registry/tools';
import { useWorkspaceStore } from '@/stores/useWorkspaceStore';
import { ToolCard } from '@/components/tools/ToolCard';
import { ToolIcon } from '@/components/shared/ToolIcon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const FAQS = [
  {
    q: 'Do I need an account to use DevTools Hub?',
    a: 'No. All 47 client-side developer utilities work immediately without registration. An account is only needed for cloud-synced favorites, saved snippets, API collections, and optional AI quotas.',
  },
  {
    q: 'Is my code or data sent to a server?',
    a: 'Client-side tools (JSON, formatters, converters, password generator, hashing, JWT decoder, regex tester) execute strictly in your browser. Passwords, JWTs, and private keys are never logged or stored.',
  },
  {
    q: 'How do the AI-powered tools work?',
    a: 'AI Code Explainer, Code Reviewer, and Documentation Generator use an optional server-side Gemini API integration. You must explicitly consent before any code is sent, and core tools remain 100% functional even if AI is disabled.',
  },
  {
    q: 'Can I self-host DevTools Hub?',
    a: 'Yes. DevTools Hub is built with Next.js, Prisma, and PostgreSQL, and includes Docker Compose support and free-tier deployment instructions.',
  },
];

export function LandingPage({
  popularToolSlugs = [],
}: {
  popularToolSlugs?: Array<{ slug: string; count: number }>;
}) {
  const setCommandPaletteOpen = useWorkspaceStore((s) => s.setCommandPaletteOpen);
  const featuredTools = getFeaturedTools();
  const allTools = getAllTools();

  const popularTools = popularToolSlugs
    .map((entry) => {
      const tool = allTools.find((t) => t.slug === entry.slug);
      return tool ? { tool, count: entry.count } : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div className="space-y-20 pb-12">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] px-6 py-14 text-center sm:px-12 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <Badge variant="cyan" className="mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            50 Developer Utilities • Privacy-First Architecture
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Everything developers need.{' '}
            <span className="text-[#7C3AED]">One workspace.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base text-[var(--muted-foreground)] sm:text-lg">
            Format JSON, validate schemas, convert data, test regex in isolated workers, design CSS,
            and inspect APIs — fast, responsive, and executed locally in your browser.
          </p>

          {/* Global Tool Search Trigger */}
          <div className="mx-auto mt-8 max-w-xl">
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="flex h-12 w-full items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm text-[var(--muted-foreground)] shadow-sm transition hover:border-[#7C3AED]/60 cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Search className="h-4 w-4 text-[#7C3AED]" />
                Search 50+ tools (JSON, SQL, Base64, Regex, JWT, CSS...)
              </span>
              <kbd className="rounded border border-[var(--border)] bg-[var(--muted)] px-2 py-0.5 text-xs font-medium">
                Ctrl + K
              </kbd>
            </button>
          </div>

          {/* Primary & Secondary CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/tools">
              <Button size="lg">
                Explore Developer Tools
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/tools/json/json-formatter">
              <Button variant="outline" size="lg">
                Open Workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Featured Developer Tools */}
      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Featured Developer Tools</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Everyday utilities ready to use with zero sign-up required.
            </p>
          </div>
          <Link
            href="/tools"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#A78BFA] hover:underline"
          >
            View all {allTools.length} tools
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredTools.slice(0, 8).map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* 3. Tool Category Cards */}
      <section id="categories">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Browse by Category</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Eight modular toolkits covering data, code, styling, security, APIs, and AI.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TOOL_CATEGORIES.filter((c) => c.isActive).map((cat) => {
            const count = allTools.filter((t) => t.category === cat.slug).length;
            return (
              <Link
                key={cat.id}
                href={`/tools/${cat.slug}`}
                className="group rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all hover:border-[#06B6D4]/60 hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#06B6D4]/10 text-[#06B6D4]">
                    <ToolIcon name={cat.icon} className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-medium text-[var(--muted-foreground)]">
                    {count} tools
                  </span>
                </div>
                <h3 className="font-semibold group-hover:text-[#06B6D4]">{cat.name}</h3>
                <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">{cat.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Popular Tools (Real Aggregate Usage Only) */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Popular Tools</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Ranked strictly from real aggregate tool execution counts — no fabricated metrics.
          </p>
        </div>

        {popularTools.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popularTools.map(({ tool, count }) => (
              <div key={`pop-${tool.id}`} className="space-y-1">
                <ToolCard tool={tool} />
                <p className="px-1 text-xs text-[var(--muted-foreground)]">
                  {count.toLocaleString()} recorded runs
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 p-8 text-center">
            <p className="text-sm text-[var(--muted-foreground)]">
              No aggregate usage data has been recorded yet. Start using any tool to populate real
              rankings.
            </p>
          </div>
        )}
      </section>

      {/* 5. Benefits Section */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <Zap className="mb-3 h-6 w-6 text-[#06B6D4]" />
          <h3 className="text-lg font-semibold">Instant Client-Side Speed</h3>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Formatting, diffing, conversions, and Web Worker regex matching run directly in your
            browser with zero network round-trips.
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <Lock className="mb-3 h-6 w-6 text-[#22C55E]" />
          <h3 className="text-lg font-semibold">Privacy by Design</h3>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Generated passwords, JWTs, and sensitive payloads are never logged or stored in
            analytics.
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <ShieldCheck className="mb-3 h-6 w-6 text-[#7C3AED]" />
          <h3 className="text-lg font-semibold">Hardened Utilities</h3>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            XXE-safe XML parsing, DOMPurify-sanitized Markdown, CSV formula-injection protection,
            and sandboxed iframe code previews.
          </p>
        </div>
      </section>

      {/* 6. AI Tools Section */}
      <section className="rounded-2xl border border-[#7C3AED]/30 bg-[#7C3AED]/5 p-8 sm:p-10">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <Badge variant="default" className="mb-3">
              <Bot className="h-3.5 w-3.5" />
              Optional AI Assistance
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Explain, Review, and Document Code with Gemini
            </h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)] sm:text-base">
              Built-in consent prompts, server-side API key isolation, and daily user quotas. Core
              developer utilities remain 100% available even without an AI key.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/tools/ai">
              <Button>Explore AI Tools</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. How It Works */}
      <section>
        <h2 className="mb-6 text-2xl font-bold tracking-tight">How It Works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              step: '01',
              title: 'Search or Pick a Tool',
              desc: 'Press Ctrl+K anywhere or browse 8 categories to open any utility.',
            },
            {
              step: '02',
              title: 'Process Locally & Safely',
              desc: 'Paste, upload, or load sample data into the split editor workspace.',
            },
            {
              step: '03',
              title: 'Copy, Export, or Save',
              desc: 'Copy results in one click, download files, or sign in to save snippets and favorites.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6"
            >
              <span className="font-mono text-xs font-bold text-[#06B6D4]">STEP {item.step}</span>
              <h3 className="mt-2 font-semibold">{item.title}</h3>
              <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. FAQ */}
      <section>
        <h2 className="mb-6 text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {FAQS.map((item) => (
            <div
              key={item.q}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5"
            >
              <h3 className="font-semibold">{item.q}</h3>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
