import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useMyDonations } from '../hooks/useCampaigns';
import PageWrapper from '../components/layout/PageWrapper';
import Avatar from '../components/ui/Avatar';
import { FullPageSpinner } from '../components/ui/Spinner';
import { formatCurrency, formatDate, getCategoryMeta } from '../lib/utils';
import {
  Heart, TrendingUp, Clock, ExternalLink, HandHeart, ArrowRight,
  Sparkles, Globe,
} from 'lucide-react';

export default function BackerDashboardPage() {
  const { user, profile } = useAuth();
  const { data: donations, isLoading } = useMyDonations(user?.id);

  if (isLoading) return <FullPageSpinner />;

  const completed = donations?.filter((d) => d.status === 'completed') ?? [];
  const pending = donations?.filter((d) => d.status === 'pending') ?? [];
  const totalDonated = completed.reduce((sum, d) => sum + d.amount, 0);
  const uniqueCampaigns = new Set(completed.map((d) => d.campaign_id)).size;

  const stats = [
    { label: 'Total Backed', value: formatCurrency(totalDonated), icon: Heart, accent: 'from-accent-500 to-rose-600' },
    { label: 'Campaigns', value: uniqueCampaigns, icon: Globe, accent: 'from-primary-500 to-purple-600' },
    { label: 'Pending', value: pending.length, icon: Clock, accent: 'from-amber-500 to-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-primary-700 via-primary-800 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-mesh-hero opacity-80 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-20">
          <div className="flex flex-wrap items-center gap-5">
            <Avatar src={profile?.avatar_url} name={profile?.name} size="xl" className="ring-4 ring-white/20" />
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
                <Sparkles size={12} /> Backer
              </div>
              <h1 className="font-display text-display-xs sm:text-display-sm text-white">
                Welcome back, {profile?.name?.split(' ')[0] ?? 'Backer'}.
              </h1>
              <p className="text-white/70 mt-1.5 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <PageWrapper>
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 -mt-12 relative z-10 mb-10">
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

        {/* Donations list */}
        <div className="rounded-3xl bg-white border border-ink-100 shadow-card overflow-hidden">
          <div className="border-b border-ink-100 px-6 py-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-extrabold text-ink-900">My donations</h2>
              <p className="text-xs text-ink-500 mt-0.5">{donations?.length ?? 0} donations to date</p>
            </div>
            <Link
              to="/dashboard/backer/donations"
              className="inline-flex items-center gap-1 text-xs font-bold text-primary-700 hover:text-primary-800"
            >
              See all <ArrowRight size={12} />
            </Link>
          </div>

          {!donations?.length ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="relative mb-5">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-400 to-primary-500 blur-2xl opacity-30 rounded-full" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-rose-600 text-white shadow-pop">
                  <HandHeart size={28} />
                </div>
              </div>
              <h3 className="font-display text-lg font-extrabold text-ink-900">No donations yet</h3>
              <p className="text-sm text-ink-500 mt-1 max-w-sm">Browse campaigns and back a project you believe in.</p>
              <Link
                to="/"
                className="mt-6 inline-flex items-center gap-1.5 rounded-2xl bg-primary-600 hover:bg-primary-700 px-5 py-2.5 text-sm font-bold text-white transition-colors"
              >
                Discover campaigns <ExternalLink size={13} />
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-ink-100">
              {donations.slice(0, 8).map((donation) => {
                const cat = getCategoryMeta(donation.campaigns?.category);
                return (
                  <li key={donation.id} className="flex items-center justify-between px-6 py-4 hover:bg-ink-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      {donation.campaigns?.image_url ? (
                        <img
                          src={donation.campaigns.image_url}
                          alt={donation.campaigns.title}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                      ) : (
                        <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-xl bg-gradient-to-br ${cat.gradient}`}>
                          {cat.emoji}
                        </div>
                      )}
                      <div className="min-w-0">
                        <Link
                          to={`/campaigns/${donation.campaign_id}`}
                          className="font-bold text-ink-900 hover:text-primary-700 line-clamp-1 transition-colors"
                        >
                          {donation.campaigns?.title ?? 'Campaign'}
                        </Link>
                        <p className="text-xs text-ink-500 mt-0.5">
                          {donation.reward_tiers?.title ?? 'No tier'} · {formatDate(donation.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-display font-extrabold text-ink-900">
                        {formatCurrency(donation.amount)}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                        donation.status === 'completed' ? 'bg-emerald-100 text-emerald-700'
                        : donation.status === 'pending'  ? 'bg-amber-100 text-amber-700'
                        : 'bg-accent-100 text-accent-700'
                      }`}>
                        {donation.status}
                      </span>
                    </div>
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
