import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import {
  useCampaignAnalytics,
  useCampaignDailyTotals,
  useCampaignerSummary,
} from '../hooks/useAnalytics';
import PageWrapper from '../components/layout/PageWrapper';
import { FullPageSpinner } from '../components/ui/Spinner';
import { formatCurrency, formatDate } from '../lib/utils';
import {
  TrendingUp, Users, Target, Activity, BarChart3, Award, Sparkles, Calendar,
} from 'lucide-react';

export default function CampaignerAnalyticsPage() {
  const { user } = useAuth();
  const { data: campaigns = [], isLoading: loadingCampaigns } = useCampaignAnalytics(user?.id);
  const { data: summary, isLoading: loadingSummary } = useCampaignerSummary(user?.id);
  const [selectedId, setSelectedId] = useState(null);
  const { data: dailyTotals = [], isLoading: loadingDaily } = useCampaignDailyTotals(selectedId);

  // Auto-select first campaign once data loads
  useEffect(() => {
    if (!selectedId && campaigns.length > 0) {
      setSelectedId(campaigns[0].campaign_id);
    }
  }, [campaigns, selectedId]);

  const selected = useMemo(
    () => campaigns.find((c) => c.campaign_id === selectedId),
    [campaigns, selectedId]
  );

  if (loadingCampaigns || loadingSummary) return <FullPageSpinner />;

  const summaryCards = [
    { label: 'Total Raised',     value: formatCurrency(summary?.total_raised ?? 0),  icon: TrendingUp, accent: 'from-emerald-500 to-teal-600' },
    { label: 'Unique Backers',   value: summary?.total_unique_backers ?? 0,            icon: Users,      accent: 'from-primary-500 to-purple-600' },
    { label: 'Active Campaigns', value: summary?.active_campaigns ?? 0,                icon: Activity,   accent: 'from-amber-500 to-orange-600' },
    { label: 'Total Donations',  value: summary?.total_donations ?? 0,                 icon: Target,     accent: 'from-accent-500 to-rose-600' },
  ];

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Hero band */}
      <div className="relative bg-gradient-to-br from-primary-700 via-primary-800 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-mesh-hero opacity-80 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-20">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 mb-3">
            <Sparkles size={12} /> Campaigner
          </div>
          <h1 className="font-display text-display-xs sm:text-display-sm text-white">
            Analytics
          </h1>
          <p className="text-white/70 mt-2 text-sm max-w-xl">
            Track funding momentum, backer growth, and donation trends across every campaign you&apos;ve launched.
          </p>
        </div>
      </div>

      <PageWrapper>
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-12 relative z-10 mb-8">
          {summaryCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="rounded-3xl bg-white border border-ink-100 shadow-pop p-5"
            >
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.accent} text-white shadow-soft mb-3`}>
                <stat.icon size={16} />
              </div>
              <div className="font-display text-xl font-extrabold text-ink-900 leading-none">
                {stat.value}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-ink-500 mt-1.5">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Campaign list */}
          <div className="lg:col-span-1">
            <div className="rounded-3xl bg-white border border-ink-100 shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-ink-100">
                <h2 className="font-display font-extrabold text-ink-900">My campaigns</h2>
                <p className="text-xs text-ink-500 mt-0.5">{campaigns.length} total</p>
              </div>
              {campaigns.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <Award size={28} className="mx-auto mb-3 text-ink-300" />
                  <p className="text-sm text-ink-500">Launch a campaign and its analytics will appear here.</p>
                </div>
              ) : (
                <ul className="divide-y divide-ink-100 max-h-[600px] overflow-y-auto">
                  {campaigns.map((c) => {
                    const active = selectedId === c.campaign_id;
                    return (
                      <li key={c.campaign_id}>
                        <button
                          onClick={() => setSelectedId(c.campaign_id)}
                          className={`w-full text-left px-5 py-4 transition-colors ${
                            active ? 'bg-primary-50/60 border-l-4 border-primary-600' : 'border-l-4 border-transparent hover:bg-ink-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <p className="font-bold text-ink-900 truncate text-sm">{c.title}</p>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              c.status === 'active' ? 'bg-emerald-100 text-emerald-700'
                              : c.status === 'pending' ? 'bg-amber-100 text-amber-700'
                              : 'bg-ink-100 text-ink-600'
                            }`}>{c.status}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden mb-2">
                            <div
                              className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
                              style={{ width: `${Math.min(c.goal_percent, 100)}%` }}
                            />
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-ink-500">
                            <span className="font-semibold text-ink-700">{formatCurrency(c.raised_amount)}</span>
                            <span>·</span>
                            <span>{c.goal_percent}% funded</span>
                            <span>·</span>
                            <span>{c.unique_backer_count} backers</span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-2 space-y-6">
            {selected ? (
              <>
                <div className="rounded-3xl bg-white border border-ink-100 shadow-card p-6">
                  <div className="flex items-start justify-between mb-5 gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400 mb-1">Campaign</p>
                      <h2 className="font-display text-xl font-extrabold text-ink-900 truncate">{selected.title}</h2>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shrink-0 ${
                      selected.status === 'active' ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-ink-100 text-ink-600'
                    }`}>{selected.status}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Stat label="Goal"          value={formatCurrency(selected.goal_amount)} />
                    <Stat label="Raised"        value={formatCurrency(selected.raised_amount)} highlight />
                    <Stat label="Goal %"        value={`${selected.goal_percent}%`} />
                    <Stat label="Donations"     value={selected.donation_count} />
                    <Stat label="Avg donation"  value={formatCurrency(selected.average_donation)} />
                    <Stat label="Largest"       value={formatCurrency(selected.largest_donation)} />
                    <Stat label="Last 7d"       value={formatCurrency(selected.raised_last_7d)} />
                    <Stat label="Last donation" value={selected.last_donation_at ? formatDate(selected.last_donation_at) : '—'} />
                  </div>
                </div>

                <div className="rounded-3xl bg-white border border-ink-100 shadow-card p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Trend</p>
                      <h3 className="font-display text-base font-extrabold text-ink-900 flex items-center gap-2 mt-0.5">
                        <BarChart3 size={16} className="text-primary-600" /> Last 30 days
                      </h3>
                    </div>
                    <div className="text-xs text-ink-500 flex items-center gap-1.5">
                      <Calendar size={12} /> 30-day rolling
                    </div>
                  </div>
                  {loadingDaily ? (
                    <div className="h-64 rounded-2xl bg-ink-50 animate-pulse" />
                  ) : (
                    <DailyChart points={dailyTotals} />
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-3xl bg-white border border-ink-100 shadow-card py-20 text-center">
                <Award className="mx-auto text-ink-300" size={40} />
                <p className="mt-3 text-sm text-ink-500">Select a campaign on the left to see its analytics.</p>
              </div>
            )}
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}

function Stat({ label, value, highlight = false }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">{label}</p>
      <p className={`mt-1 font-display font-extrabold ${highlight ? 'text-primary-700 text-xl' : 'text-ink-900 text-lg'}`}>
        {value}
      </p>
    </div>
  );
}

function DailyChart({ points }) {
  if (!points?.length) {
    return (
      <div className="h-64 rounded-2xl bg-ink-50 flex items-center justify-center">
        <p className="text-sm text-ink-500 text-center px-6">
          Donation activity will appear here once your campaign starts receiving backers.
        </p>
      </div>
    );
  }
  const data = points.map((p) => ({
    date: p.date,
    total: Number(p.total),
    count: p.count,
  }));
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 6, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="grad-funding" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#6366f1" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12, border: '1px solid #e2e8f0',
              boxShadow: '0 12px 28px -6px rgb(15 23 42 / 0.12)',
              fontSize: 12,
            }}
            labelStyle={{ color: '#0f172a', fontWeight: 700 }}
            formatter={(value, name) => [
              name === 'total' ? formatCurrency(value) : value,
              name === 'total' ? 'Raised' : 'Donations',
            ]}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#4f46e5"
            strokeWidth={2.5}
            fill="url(#grad-funding)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
// CampaignerAnalyticsPage — 30-day Recharts area chart
