import { cn } from '../../lib/utils';

interface Props {
  amount: number;
  currency?: string;
  emphasize?: boolean;
  className?: string;
  signed?: boolean;
}

export function MoneyDisplay({ amount, currency = 'USD', emphasize, className, signed }: Props) {
  const sign = signed && amount > 0 ? '+' : amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  const integer = Math.floor(abs);
  const dec = (abs - integer).toFixed(2).slice(2);
  const formattedInt = integer.toLocaleString('en-US');
  const symbol = currency === 'USD' ? '$' : currency;
  return (
    <span className={cn('inline-flex items-baseline tabular-nums', emphasize && 'font-semibold tracking-tight', className)}>
      {sign}
      <span className={cn('text-[0.65em] mr-0.5 align-top relative -top-[0.15em]', emphasize ? 'opacity-80' : 'opacity-90')}>
        {symbol}
      </span>
      <span>{formattedInt}</span>
      <span className={cn('text-[0.85em]', emphasize ? 'opacity-80' : 'opacity-90')}>.{dec}</span>
    </span>
  );
}
