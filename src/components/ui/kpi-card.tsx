import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface Props {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  trend?: 'up' | 'down' | 'flat';
  trendLabel?: string;
  icon?: ReactNode;
  accent?: 'blue' | 'green' | 'amber' | 'rose' | 'violet';
  className?: string;
}

const ACCENT: Record<NonNullable<Props['accent']>, string> = {
  blue: 'text-[var(--juice-primary)] bg-[var(--juice-section)]',
  green: 'text-emerald-700 bg-emerald-50',
  amber: 'text-amber-700 bg-amber-50',
  rose: 'text-rose-700 bg-rose-50',
  violet: 'text-violet-700 bg-violet-50',
};

const TREND: Record<NonNullable<Props['trend']>, string> = {
  up: 'text-emerald-600',
  down: 'text-rose-600',
  flat: 'text-slate-500',
};

export function KpiCard({ label, value, hint, trend, trendLabel, icon, accent = 'blue', className }: Props) {
  return (
    <div className={cn('rounded-2xl bg-white border border-[var(--juice-stroke)] p-4', className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">{label}</div>
        {icon && (
          <span className={cn('inline-flex h-7 w-7 rounded-lg items-center justify-center', ACCENT[accent])}>
            {icon}
          </span>
        )}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</div>
      <div className="mt-1 flex items-center gap-2 text-xs">
        {trend && trendLabel && <span className={cn('font-medium', TREND[trend])}>{trendLabel}</span>}
        {hint && <span className="text-slate-500">{hint}</span>}
      </div>
    </div>
  );
}
