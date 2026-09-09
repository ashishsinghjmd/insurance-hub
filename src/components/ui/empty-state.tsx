import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface Props {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, body, action, className }: Props) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-12 px-4', className)}>
      {icon && (
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--juice-section)] text-[var(--juice-primary)]">
          {icon}
        </div>
      )}
      <div className="text-sm font-medium text-slate-800">{title}</div>
      {body && <p className="text-xs text-slate-500 mt-1 max-w-md">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
