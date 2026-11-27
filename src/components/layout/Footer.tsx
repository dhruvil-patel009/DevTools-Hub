import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { BrandLogo } from '@/components/shared/BrandLogo';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)]/40">
      <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-[var(--muted-foreground)] sm:flex-row sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <BrandLogo className="h-6 w-6 shrink-0" />
          <span className="font-semibold text-[var(--foreground)]">{siteConfig.name}</span>
          <span className="hidden md:inline">— {siteConfig.tagline}</span>
          <span className="text-xs text-[var(--muted-foreground)]">
            • Built by{' '}
            <a
              href={siteConfig.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#A78BFA] hover:underline"
            >
              {siteConfig.author}
            </a>
          </span>
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
