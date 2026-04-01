import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Heart, Users } from 'lucide-react';
import Badge from '../ui/Badge';
import { formatCurrency, getDaysLeft, getCategoryMeta, truncate, getFundingPercent } from '../../lib/utils';

export default function CampaignCard({ campaign, index = 0 }) {
  const {
    id, title, description, category, goal_amount, raised_amount,
    image_url, deadline, profiles, donations_count,
  } = campaign;

  const daysLeft = getDaysLeft(deadline);
  const catMeta = getCategoryMeta(category);
  const percent = getFundingPercent(raised_amount, goal_amount);
  const isExpiring = daysLeft <= 7 && daysLeft > 0;
  const isEnded = daysLeft === 0;
  const isFullyFunded = percent >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4), ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/campaigns/${id}`}
        className="group block rounded-3xl bg-white border border-ink-100 shadow-card hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
      >
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-ink-100">
          {image_url ? (
            <img
              src={image_url}
              alt={title}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className={`relative h-full w-full bg-gradient-to-br ${catMeta.gradient}`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_55%)]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <span className="text-6xl drop-shadow-lg">{catMeta.emoji}</span>
                <span className="mt-3 text-[10px] font-bold tracking-[0.25em] uppercase opacity-90">{catMeta.label}</span>
              </div>
            </div>
          )}

          {/* Top-left category chip */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-ink-700 shadow-soft">
              <span>{catMeta.emoji}</span>
              {catMeta.label}
            </span>
          </div>

          {/* Top-right status */}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
            {isFullyFunded && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-soft">
                ✓ Funded
              </span>
            )}
            {!isFullyFunded && isExpiring && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-soft">
                {daysLeft}d left
              </span>
            )}
          </div>

          {/* Percent badge bottom-left */}
          <div className="absolute bottom-3 left-3">
            <div className="inline-flex items-baseline gap-1 rounded-2xl bg-ink-900/85 backdrop-blur-md px-3 py-1.5 text-white shadow-soft">
              <span className="font-display text-lg font-extrabold leading-none">{percent}</span>
              <span className="text-[10px] font-semibold opacity-80">% funded</span>
            </div>
          </div>

          {isEnded && (
            <div className="absolute inset-0 bg-ink-900/55 backdrop-blur-[1px] flex items-center justify-center">
              <span className="text-white font-display font-bold text-lg tracking-wide">Campaign Ended</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Creator row */}
          <div className="flex items-center gap-2 text-xs">
            <span className="h-5 w-5 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 ring-2 ring-white" />
            <span className="text-ink-500 truncate">by <span className="text-ink-700 font-semibold">{profiles?.name ?? 'Anonymous'}</span></span>
          </div>

          {/* Title + description */}
          <div>
            <h3 className="font-display font-extrabold text-ink-900 group-hover:text-primary-700 transition-colors line-clamp-2 leading-snug text-base">
              {title}
            </h3>
            <p className="mt-1.5 text-sm text-ink-500 line-clamp-2 leading-relaxed">
              {truncate(description, 100)}
            </p>
          </div>

          {/* Progress bar */}
          <div>
            <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${
                  isFullyFunded
                    ? 'from-emerald-400 to-emerald-600'
                    : 'from-primary-500 via-primary-600 to-accent-500'
                } transition-all duration-500`}
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="font-display text-base font-extrabold text-ink-900">
                {formatCurrency(raised_amount)}
              </div>
              <div className="text-[11px] text-ink-500">of {formatCurrency(goal_amount)}</div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end text-xs font-semibold text-ink-700">
                <Calendar size={11} className="text-ink-400" />
                {daysLeft > 0 ? `${daysLeft}d` : 'Ended'}
              </div>
              {donations_count != null && (
                <div className="flex items-center gap-1 justify-end text-[11px] text-ink-500 mt-0.5">
                  <Users size={10} />
                  {donations_count} backer{donations_count !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Skeleton loader
export function CampaignCardSkeleton() {
  return (
    <div className="rounded-3xl bg-white border border-ink-100 shadow-card overflow-hidden">
      <div className="aspect-[16/10] skeleton" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="space-y-1.5">
          <div className="skeleton h-5 w-full rounded" />
          <div className="skeleton h-5 w-3/4 rounded" />
        </div>
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-2 w-full rounded" />
        <div className="flex justify-between">
          <div className="skeleton h-4 w-20 rounded" />
          <div className="skeleton h-3 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}
