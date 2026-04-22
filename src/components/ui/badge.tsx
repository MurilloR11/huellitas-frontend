import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:   'bg-primary text-primary-foreground',
        secondary: 'bg-muted text-muted-foreground',
        outline:   'border border-muted-foreground/30 text-muted-foreground',
        /* Status variants — resolve through CSS vars so dark mode swaps work */
        available: 'bg-status-available-bg text-status-available-fg',
        pending:   'bg-status-pending-bg   text-status-pending-fg',
        reserved:  'bg-status-error-bg     text-status-error-fg',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
