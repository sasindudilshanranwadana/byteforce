import { cn } from '../../lib/utils';

export default function Progress({ value = 0, max = 100, className, size = 'md', color = 'primary' }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  const colors = {
    primary: 'bg-primary-600',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn('w-full overflow-hidden rounded-full bg-slate-100', heights[size], className)}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500 ease-out',
          colors[color] ?? colors.primary
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
