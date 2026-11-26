import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ToolsDirectoryClient } from '@/features/landing/ToolsDirectoryClient';

export const metadata: Metadata = {
  title: 'All Developer Tools',
  description:
    'Browse all 50+ developer utilities across JSON, code formatting, data converters, CSS design, cryptography, text, APIs, and AI.',
};

export default function AllToolsPage() {
  return (
    <AppShell>
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'All Tools' }]} />
      <ToolsDirectoryClient />
    </AppShell>
  );
}
