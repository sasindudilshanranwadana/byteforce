import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  useCampaignAnalytics,
  useCampaignDailyTotals,
  useCampaignerSummary,
} from '../hooks/useAnalytics';
import PageWrapper from '../components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { FullPageSpinner } from '../components/ui/Spinner';
import { formatCurrency, formatDate } from '../lib/utils';
import {
  TrendingUp,
  Users,
  Target,
  Activity,
  BarChart3,
  Award,
} from 'lucide-react';

// SCRUM-25: Campaigner Analytics Dashboard
// At-a-glance summary + per-campaign breakdown + 30-day chart.

export default function CampaignerAnalyticsPage() {
  const { user } = useAuth();
  const { data: campaigns = [], isLoading: loadingCampaigns } = useCampaignAnalytics(user?.id);
  const { data: summary, isLoading: loadingSummary } = useCampaignerSummary(user?.id);
  const [selectedId, setSelectedId] = useState(null);
  const { data: dailyTotals = [], isLoading: loadingDaily } = useCampaignDailyTotals(selectedId);

  const selected = useMemo(
    () => campaigns.find((c) => c.campaign_id === selectedId),
    [campaigns, selectedId]
  );

  if (loadingCampaigns || loadingSummary) return <FullPageSpinner />;

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Analytics</h1>
        <p className="text-slate-500 mt-1">Track funding, backers, and donation trends across your campaigns.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard icon={<TrendingUp size={20} className="text-emerald-500" />} label="Total Raised" value={formatCurrency(summary?.total_raised ?? 0)} bg="bg-emerald-50" />
        <SummaryCard icon={<Users size={20} className="text-blue-500" />} label="Unique Backers" value={summary?.total_unique_backers ?? 0} bg="bg-blue-50" />
        <SummaryCard icon={<Activity size={20} className="text-primary-500" />} label="Active Campaigns" value={summary?.active_campaigns ?? 0} bg="bg-primary-50" />
        <SummaryCard icon={<Target size={20} className="text-amber-500" />} label="Total Donations" value={summary?.total_donations ?? 0} bg="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign list */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>My Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {campaigns.length === 0 ? (
              <p className="text-sm text-slate-500 p-4">No campaigns yet.</p>
            ) : (
              campaigns.map((c) => (
                <button
                  key={c.campaign_id}
                  onClick={() => setSelectedId(c.campaign_id)}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${selectedId === c.campaign_id ? 'bg-primary-50/40' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-slate-900 truncate">{c.title}</p>
                    <Badge variant={c.status}>{c.status}</Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                    <span>{formatCurrency(c.raised_amount)} raised</span>
                    <span>{c.goal_percent}% of goal</span>
                    <span>{c.unique_backer_count} backers</span>
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Detail panel */}
        <div className="lg:col-span-2 space-y-6">
          {selected ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{selected.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Stat label="Goal" value={formatCurrency(selected.goal_amount)} />
                    <Stat label="Raised" value={formatCurrency(selected.raised_amount)} />
                    <Stat label="Goal %" value={`${selected.goal_percent}%`} />
                    <Stat label="Donations" value={selected.donation_count} />
                    <Stat label="Avg Donation" value={formatCurrency(selected.average_donation)} />
                    <Stat label="Largest" value={formatCurrency(selected.largest_donation)} />
                    <Stat label="Last 7d Raised" value={formatCurrency(selected.raised_last_7d)} />
                    <Stat label="Last donation" value={selected.last_donation_at ? formatDate(selected.last_donation_at) : '—'} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    <span className="inline-flex items-center gap-2">
                      <BarChart3 size={18} className="text-primary-600" /> Last 30 days
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingDaily ? (
                    <p className="text-sm text-slate-500">Loading…</p>
                  ) : (
                    <DailyChart points={dailyTotals} />
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Award className="mx-auto text-slate-300" size={40} />
                <p className="mt-3 text-slate-500">Select a campaign on the left to see its analytics.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

function SummaryCard({ icon, label, value, bg }) {
  return (
    <div className={`rounded-2xl p-4 ${bg}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-xs font-medium text-slate-600">{label}</p>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

// Lightweight SVG bar chart — zero external dependency
function DailyChart({ points }) {
  if (!points?.length) return <p className="text-sm text-slate-500">No data.</p>;
  const max = Math.max(...points.map((p) => Number(p.total)), 1);
  const w = 600;
  const h = 160;
  const barW = w / points.length;

  return (
    <svg viewBox={`0 0 ${w} ${h + 28}`} className="w-full h-48">
      {points.map((p, i) => {
        const barH = (Number(p.total) / max) * h;
        return (
          <g key={p.date} transform={`translate(${i * barW}, ${h - barH})`}>
            <rect width={barW - 2} height={barH} rx={3} fill="#7c3aed" opacity={0.85} />
            <title>{`${p.date}: ${formatCurrency(p.total)} (${p.count} donations)`}</title>
          </g>
        );
      })}
      {/* X-axis labels — first / middle / last */}
      <text x={0} y={h + 18} fontSize={10} fill="#64748b">{points[0]?.date}</text>
      <text x={w / 2 - 24} y={h + 18} fontSize={10} fill="#64748b">{points[Math.floor(points.length / 2)]?.date}</text>
      <text x={w - 60} y={h + 18} fontSize={10} fill="#64748b">{points[points.length - 1]?.date}</text>
    </svg>
  );
}
