import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-[#7C3AED]/30 bg-[#7C3AED]/15 text-[#A78BFA]',
        cyan: 'border-[#06B6D4]/30 bg-[#06B6D4]/15 text-[#22D3EE]',
        success: 'border-[#22C55E]/30 bg-[#22C55E]/15 text-[#4ADE80]',
        destructive: 'border-[#EF4444]/30 bg-[#EF4444]/15 text-[#F87171]',
        outline: 'border-[var(--border)] text-[var(--muted-foreground)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
