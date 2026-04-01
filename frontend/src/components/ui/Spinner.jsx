import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export default function Spinner({ size = 'md', className, label = 'Loading...' }) {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 36,
    xl: 48,
  };

  return (
    <div className={cn('flex items-center justify-center', className)} role="status">
      <Loader2
        size={sizes[size] ?? sizes.md}
        className="animate-spin text-primary-600"
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={40} className="animate-spin text-primary-600" />
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    </div>
  );
}
