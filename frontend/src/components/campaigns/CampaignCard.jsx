import { Link } from 'react-router-dom';
import { Calendar, Users } from 'lucide-react';
import Badge from '../ui/Badge';
import ProgressBar from './ProgressBar';
import { formatCurrency, getDaysLeft, getCategoryMeta, truncate } from '../../lib/utils';

export default function CampaignCard({ campaign }) {
  const {
    id,
    title,
    description,
    category,
    goal_amount,
    raised_amount,
    image_url,
    deadline,
    profiles,
  } = campaign;

  const daysLeft = getDaysLeft(deadline);
  const catMeta = getCategoryMeta(category);
  const isExpiring = daysLeft <= 7 && daysLeft > 0;

  return (
    <Link
      to={`/campaigns/${id}`}
      className="group block rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
        {image_url ? (
          <img
            src={image_url}
            alt={title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50">
            <span className="text-5xl">{catMeta.emoji}</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge className={catMeta.color}>
            {catMeta.emoji} {catMeta.label}
          </Badge>
        </div>
        {isExpiring && (
          <div className="absolute top-3 right-3">
            <Badge variant="danger">
              {daysLeft}d left
            </Badge>
          </div>
        )}
        {daysLeft === 0 && (
          <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Campaign Ended</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Creator */}
        <p className="text-xs text-slate-500 flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 inline-block" />
          {profiles?.name ?? 'Anonymous'}
        </p>

        {/* Title + description */}
        <div>
          <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
            {title}
          </h3>
          <p className="mt-1 text-sm text-slate-500 line-clamp-2">
            {truncate(description, 100)}
          </p>
        </div>

        {/* Progress */}
        <ProgressBar raised={raised_amount} goal={goal_amount} size="sm" />

        {/* Meta row */}
        <div className="flex items-center justify-between pt-1 text-xs text-slate-500 border-t border-slate-50">
          <span className="font-semibold text-slate-700">{formatCurrency(goal_amount)} goal</span>
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
          </span>
        </div>
      </div>
    </Link>
  );
}

// Skeleton loader
export function CampaignCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
      <div className="aspect-[16/9] skeleton" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="space-y-1.5">
          <div className="skeleton h-5 w-full rounded" />
          <div className="skeleton h-5 w-3/4 rounded" />
        </div>
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-2.5 w-full rounded" />
        <div className="flex justify-between">
          <div className="skeleton h-3 w-20 rounded" />
          <div className="skeleton h-3 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}
