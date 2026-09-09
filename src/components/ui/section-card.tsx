import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface Props {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  noPad?: boolean;
}

export function SectionCard({ title, subtitle, actions, children, className, bodyClassName, noPad }: Props) {
  return (
    <section className={cn('rounded-2xl bg-white border border-[var(--juice-stroke)]', className)}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--juice-stroke)]">
          <div className="min-w-0">
            {title && <div className="text-sm font-semibold text-slate-900 truncate">{title}</div>}
            {subtitle && <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </header>
      )}
      <div className={cn(noPad ? '' : 'p-4', bodyClassName)}>{children}</div>
    </section>
  );
}
