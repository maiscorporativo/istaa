// src/components/StatusBadge.tsx
import type { Organization } from '../types';
import clsx from 'clsx';

const statusConfig: Record<Organization['status'], { label: string; className: string }> = {
  'Ativo':     { label: 'Ativo',      className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  'Inativo':   { label: 'Inativo',    className: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
  'Em análise':{ label: 'Em análise', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
};

export function StatusBadge({ status }: { status: Organization['status'] }) {
  const cfg = statusConfig[status];
  return (
    <span className={clsx('chip border', cfg.className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
      {cfg.label}
    </span>
  );
}
