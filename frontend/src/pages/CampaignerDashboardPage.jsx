import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useMyCampaigns, useCampaignDonations } from '../hooks/useCampaigns';
import PageWrapper from '../components/layout/PageWrapper';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import { FullPageSpinner } from '../components/ui/Spinner';
import {
  formatCurrency, formatDate, getDaysLeft, getCategoryMeta, getFundingPercent,
} from '../lib/utils';
import {
  PlusCircle, TrendingUp, Target, Calendar, ChevronRight, Rocket,
  Sparkles, BarChart3, Pencil, CheckCircle2,
} from 'lucide-react';

export default function CampaignerDashboardPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { data: campaigns, isLoading } = useMyCampaigns(user?.id);
  const [expandedId, setExpandedId] = useState(null);

  if (isLoading) return <FullPageSpinner />;

  const totalRaised = campaigns?.reduce((s, c) => s + c.raised_amount, 0) ?? 0;
  const activeCampaigns = campaigns?.filter((c) => c.status === 'active').length ?? 0;
  const pendingCampaigns = campaigns?.filter((c) => c.status === 'pending').length ?? 0;
  const completedCampaigns = campaigns?.filter((c) => c.status === 'closed').length ?? 0;

  const stats = [
    { label: 'Total Raised', value: formatCurrency(totalRaised), icon: TrendingUp,    accent: 'from-emerald-500 to-teal-600' },
    { label: 'Active',       value: activeCampaigns,             icon: Target,         accent: 'from-primary-500 to-purple-600' },
    { label: 'In Review',    value: pendingCampaigns,            icon: Calendar,       accent: 'from-amber-500 to-orange-600' },
    { label: 'Completed',    value: completedCampaigns,          icon: CheckCircle2,   accent: 'from-teal-500 to-cyan-600' },
  ];

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-primary-700 via-primary-800 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-mesh-hero opacity-80 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div className="flex items-center gap-5">
              <Avatar src={profile?.avatar_url} name={profile?.name} size="xl" className="ring-4 ring-white/20" />
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
                  <Sparkles size={12} /> Campaigner
                </div>
                <h1 className="font-display text-display-xs sm:text-display-sm text-white">
                  {profile?.name?.split(' ')[0] ?? 'Creator'}&apos;s studio
                </h1>
                <p className="text-white/70 mt-1.5 text-sm">{user?.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="lg"
                onClick={() => navigate('/dashboard/campaigner/analytics')}
                variant="ghost"
                className="rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20"
              >
                <BarChart3 size={16} /> Analytics
              </Button>
              <Button
                size="lg"
                onClick={() => navigate('/campaigns/create')}
                className="rounded-2xl bg-accent-500 hover:bg-accent-600 text-white shadow-pop"
              >
                <PlusCircle size={16} /> New Campaign
              </Button>
            </div>
          </div>
        </div>
      </div>

      <PageWrapper>
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 -mt-12 relative z-10 mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-3xl bg-white border border-ink-100 shadow-pop p-6"
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.accent} text-white shadow-soft mb-4`}>
                <stat.icon size={18} />
              </div>
              <div className="font-display text-display-xs font-extrabold text-ink-900 leading-none">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-ink-500 mt-1.5 uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Campaigns */}
        <div className="rounded-3xl bg-white border border-ink-100 shadow-card overflow-hidden">
          <div className="px-6 py-5 border-b border-ink-100 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-extrabold text-ink-900">My campaigns</h2>
              <p className="text-xs text-ink-500 mt-0.5">{campaigns?.length ?? 0} total</p>
            </div>
          </div>

          {!campaigns?.length ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="relative mb-5">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 blur-2xl opacity-30 rounded-full" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-purple-700 text-white shadow-pop">
                  <Rocket size={28} />
                </div>
              </div>
              <h3 className="font-display text-lg font-extrabold text-ink-900">Launch your first campaign</h3>
              <p className="text-sm text-ink-500 mt-1 max-w-sm">Pitch your idea, set a goal, choose reward tiers — go live in 10 minutes.</p>
              <Button className="mt-6" onClick={() => navigate('/campaigns/create')}>
                <PlusCircle size={15} /> Create campaign
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-ink-100">
              {campaigns.map((campaign) => {
                const cat = getCategoryMeta(campaign.category);
                const percent = getFundingPercent(campaign.raised_amount, campaign.goal_amount);
                const daysLeft = getDaysLeft(campaign.deadline);
                const isExpanded = expandedId === campaign.id;
                return (
                  <li key={campaign.id}>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : campaign.id)}
                      className="w-full text-left px-6 py-5 hover:bg-ink-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {campaign.image_url ? (
                          <img src={campaign.image_url} alt={campaign.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                        ) : (
                          <div className={`w-14 h-14 rounded-xl shrink-0 flex items-center justify-center text-2xl bg-gradient-to-br ${cat.gradient}`}>
                            {cat.emoji}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <h3 className="font-display font-extrabold text-ink-900 truncate">{campaign.title}</h3>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              campaign.status === 'active'  ? 'bg-emerald-100 text-emerald-700'
                              : campaign.status === 'pending'  ? 'bg-amber-100 text-amber-700'
                              : campaign.status === 'closed'   ? 'bg-teal-100 text-teal-700'
                              : campaign.status === 'rejected' ? 'bg-red-100 text-red-700'
                              : 'bg-ink-100 text-ink-600'
                            }`}>{campaign.status === 'closed' ? '✓ completed' : campaign.status}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden mb-2 max-w-md">
                            <div
                              className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
                              style={{ width: `${Math.min(percent, 100)}%` }}
                            />
                          </div>
                          <div className="flex items-center gap-3 text-xs text-ink-500">
                            <span className="font-bold text-ink-700">{formatCurrency(campaign.raised_amount)}</span>
                            <span>of {formatCurrency(campaign.goal_amount)}</span>
                            <span>·</span>
                            <span>{percent}% funded</span>
                            <span className="hidden sm:inline">·</span>
                            <span className="hidden sm:inline">{daysLeft}d left</span>
                          </div>
                          {campaign.status === 'rejected' && campaign.rejection_reason && (
                            <p className="mt-1.5 text-xs text-red-600 bg-red-50 rounded-lg px-2.5 py-1.5 max-w-md">
                              <span className="font-bold">Rejection reason:</span> {campaign.rejection_reason}
                            </p>
                          )}
                        </div>
                        <ChevronRight
                          size={18}
                          className={`text-ink-400 transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
                        />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="bg-ink-50 px-6 py-5 border-t border-ink-100">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-bold text-ink-900">Recent backers</h4>
                          <div className="flex items-center gap-3">
                            {(campaign.status === 'active' || campaign.status === 'pending') && (
                              <Link
                                to={`/campaigns/${campaign.id}/edit`}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-ink-600 hover:text-ink-900 bg-white border border-ink-200 rounded-lg px-2.5 py-1 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Pencil size={11} /> Edit
                              </Link>
                            )}
                            <Link
                              to={`/campaigns/${campaign.id}`}
                              className="text-xs font-semibold text-primary-700 hover:text-primary-800"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View →
                            </Link>
                          </div>
                        </div>
                        <CampaignDonations campaignId={campaign.id} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PageWrapper>
    </div>
  );
}

function CampaignDonations({ campaignId }) {
  const { data: donations, isLoading } = useCampaignDonations(campaignId);

  if (isLoading) return <p className="text-sm text-ink-500">Loading backers…</p>;
  if (!donations?.length) return <p className="text-sm text-ink-500">No completed donations yet.</p>;

  return (
    <div className="space-y-2">
      {donations.slice(0, 5).map((d) => (
        <div key={d.id} className="flex items-center justify-between text-sm bg-white rounded-xl px-3 py-2">
          <div className="flex items-center gap-2">
            <Avatar src={d.profiles?.avatar_url} name={d.profiles?.name} size="xs" />
            <span className="font-semibold text-ink-900">{d.profiles?.name ?? 'Anonymous'}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display font-extrabold text-ink-900">{formatCurrency(d.amount)}</span>
            <span className="text-ink-400 text-xs">{formatDate(d.created_at, 'MMM d')}</span>
          </div>
        </div>
      ))}
      {donations.length > 5 && (
        <p className="text-xs text-ink-500 px-3">+ {donations.length - 5} more backers</p>
      )}
    </div>
  );
}
