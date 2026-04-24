import Progress from '../ui/Progress';
import { formatCurrency, getFundingPercent } from '../../lib/utils';

export default function ProgressBar({ raised = 0, goal = 1, showLabels = true, size = 'md' }) {
  const percent = getFundingPercent(raised, goal);
  const color = percent >= 100 ? 'success' : 'primary';

  return (
    <div className="space-y-1.5">
      <Progress value={raised} max={goal} size={size} color={color} />
      {showLabels && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            <span className="font-semibold text-slate-900">{formatCurrency(raised)}</span>
            {' '}raised
          </span>
          <span className="font-semibold text-primary-600">{percent}%</span>
        </div>
      )}
    </div>
  );
}
