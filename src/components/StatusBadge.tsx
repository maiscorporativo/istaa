// src/components/StatusBadge.tsx
import type { Organization } from '../types';
import clsx from 'clsx';

const statusConfig: Record<Organization['status'], { label: string; className: string }> = {
  'Ativo':      { label: 'Ativo',       className: 'bg-success/10 text-success border-success/25' },
  'Inativo':    { label: 'Inativo',     className: 'bg-muted-foreground/10 text-muted-foreground border-muted-foreground/25' },
  'Em análise': { label: 'Em análise',  className: 'bg-warning/10 text-warning border-warning/30' },
};

export function StatusBadge({ status }: { status: Organization['status'] }) {
  const cfg = statusConfig[status];
  return (
    <span className={clsx('chip', cfg.className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
      {cfg.label}
    </span>
  );
}
