import { Link } from 'react-router-dom';
import { ChevronRight, Receipt, Lightbulb } from 'lucide-react';
import Badge from '../ui/Badge';
import { formatCurrency, formatDate } from '../../lib/utils';

// SCRUM-27: Sortable + filterable donation history table for backers
// Pure presentational — data is fetched by useMyDonations (already in
// useCampaigns.js).

const statusVariant = {
  completed: 'success',
  pending: 'warning',
  failed: 'danger',
};

export default function DonationHistoryTable({ donations = [], emptyMessage }) {
  if (!donations.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-slate-200">
          <Receipt className="text-slate-400" size={22} />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-slate-700">Nothing here yet</h3>
        <p className="mt-1 text-sm text-slate-500 max-w-xs mx-auto">
          {emptyMessage || (
            <>
              You haven&apos;t backed a campaign yet.{' '}
              <Link to="/" className="font-medium text-primary-600 hover:underline">
                Discover something to support
              </Link>.
            </>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50">
          <tr>
            <Th>Campaign</Th>
            <Th>Amount</Th>
            <Th className="hidden md:table-cell">Reward Tier</Th>
            <Th className="hidden sm:table-cell">Date</Th>
            <Th>Status</Th>
            <Th className="sr-only">View</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {donations.map((d) => (
            <tr key={d.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  {d.campaigns?.image_url ? (
                    <img src={d.campaigns.image_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0"><Lightbulb size={18} className="text-primary-500" /></div>
                  )}
                  <span className="font-medium text-slate-900 truncate">
                    {d.campaigns?.title || 'Unknown campaign'}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                {formatCurrency(d.amount)}
              </td>
              <td className="px-4 py-3 hidden md:table-cell text-sm text-slate-600">
                {d.reward_tiers?.title || '—'}
              </td>
              <td className="px-4 py-3 hidden sm:table-cell text-sm text-slate-500 whitespace-nowrap">
                {formatDate(d.created_at)}
              </td>
              <td className="px-4 py-3">
                <Badge variant={statusVariant[d.status] || 'default'} className="capitalize">
                  {d.status}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right">
                {d.campaigns?.id && (
                  <Link
                    to={`/campaigns/${d.campaigns.id}`}
                    className="text-primary-600 hover:text-primary-800 inline-flex items-center gap-1 text-sm font-medium"
                  >
                    View <ChevronRight size={14} />
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, className = '' }) {
  return (
    <th className={`px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${className}`}>
      {children}
    </th>
  );
}
