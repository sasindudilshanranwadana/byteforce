import { cn, formatCurrency } from '../../lib/utils';
import { Gift, Check } from 'lucide-react';

export default function RewardTierCard({ tier, selected = false, onSelect, disabled = false }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onSelect?.(tier)}
      disabled={disabled}
      className={cn(
        'w-full text-left rounded-2xl border-2 p-5 transition-all duration-150',
        'hover:border-primary-400 hover:shadow-md',
        selected
          ? 'border-primary-600 bg-primary-50 shadow-md ring-1 ring-primary-200'
          : 'border-slate-200 bg-white hover:bg-primary-50/30',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              selected ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500'
            )}
          >
            {selected ? <Check size={18} /> : <Gift size={18} />}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{tier.title}</p>
            <p className="text-sm font-medium text-primary-600 mt-0.5">
              Pledge {formatCurrency(tier.minimum_amount)}+
            </p>
          </div>
        </div>
        {selected && (
          <span className="shrink-0 rounded-full bg-primary-600 px-2 py-0.5 text-xs font-semibold text-white">
            Selected
          </span>
        )}
      </div>
      <p className="mt-3 text-sm text-slate-600 leading-relaxed">{tier.description}</p>
    </button>
  );
}
