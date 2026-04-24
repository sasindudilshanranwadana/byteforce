import CampaignCard, { CampaignCardSkeleton } from './CampaignCard';

export default function CampaignGrid({ campaigns = [], loading = false, emptyMessage, emptyIcon = '🔍' }) {
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
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-6xl mb-4">{emptyIcon}</span>
        <h3 className="text-lg font-semibold text-slate-800">No campaigns found</h3>
        <p className="mt-1 text-sm text-slate-500">
          {emptyMessage ?? 'Try a different search or category.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}
