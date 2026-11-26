import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
      {items.map((item, idx) => (
        <span key={`${item.label}-${idx}`} className="inline-flex items-center gap-1.5">
          {idx > 0 && <ChevronRight className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />}
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-[var(--foreground)]">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-[var(--foreground)]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
