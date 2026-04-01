import CampaignCard, { CampaignCardSkeleton } from './CampaignCard';
import { SearchX, Compass, Rocket } from 'lucide-react';

export default function CampaignGrid({ campaigns = [], loading = false, emptyMessage, emptyIcon }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CampaignCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!campaigns.length) {
    const Icon =
      emptyIcon === 'search' ? SearchX :
      emptyIcon === '🚀'    ? Rocket :
      Compass;
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl bg-white border border-ink-100 shadow-card">
        <div className="relative mb-5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-accent-500 blur-2xl opacity-30 rounded-full" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-purple-700 text-white shadow-pop">
            <Icon size={28} />
          </div>
        </div>
        <h3 className="font-display text-lg font-extrabold text-ink-900">Nothing to show here yet</h3>
        <p className="mt-1.5 text-sm text-ink-500 max-w-md">
          {emptyMessage ?? 'Try a different search or category.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((campaign, i) => (
        <CampaignCard key={campaign.id} campaign={campaign} index={i} />
      ))}
    </div>
  );
}
