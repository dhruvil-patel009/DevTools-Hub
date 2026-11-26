import Link from 'next/link';
import { Terminal } from 'lucide-react';
import { siteConfig } from '@/config/site';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)]/40">
      <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-[var(--muted-foreground)] sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-[#7C3AED]" />
          <span className="font-semibold text-[var(--foreground)]">{siteConfig.name}</span>
          <span className="hidden sm:inline">— {siteConfig.tagline}</span>
        </div>

        <nav className="flex flex-wrap items-center gap-5" aria-label="Footer">
          <Link href="/about" className="hover:text-[var(--foreground)]">
            Documentation
          </Link>
          <Link href="/privacy" className="hover:text-[var(--foreground)]">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-[var(--foreground)]">
            Terms
          </Link>
          <Link href="/contact" className="hover:text-[var(--foreground)]">
            Contact
          </Link>
          <a
            href={siteConfig.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--foreground)]"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
