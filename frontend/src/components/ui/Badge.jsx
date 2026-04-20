import { cn } from '../../lib/utils';

const variants = {
  default:   'bg-slate-100 text-slate-700',
  primary:   'bg-primary-100 text-primary-700',
  success:   'bg-emerald-100 text-emerald-700',
  warning:   'bg-amber-100 text-amber-700',
  danger:    'bg-red-100 text-red-700',
  info:      'bg-sky-100 text-sky-700',
  // Campaign statuses
  pending:   'bg-amber-100 text-amber-700',
  active:    'bg-emerald-100 text-emerald-700',
  suspended: 'bg-red-100 text-red-700',
  closed:    'bg-slate-100 text-slate-600',
  rejected:  'bg-red-200 text-red-800',
  // Donation statuses
  completed: 'bg-emerald-100 text-emerald-700',
  failed:    'bg-red-100 text-red-700',
};

export default function Badge({ children, variant = 'default', className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide',
        variants[variant] ?? variants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
