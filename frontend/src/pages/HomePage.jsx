import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, TrendingUp, ShieldCheck, Sparkles, Zap, Heart,
  ArrowRight, BadgeCheck, Globe,
} from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import CampaignGrid from '../components/campaigns/CampaignGrid';
import Button from '../components/ui/Button';
import { useCampaigns } from '../hooks/useCampaigns';
import { usePlatformStats } from '../hooks/usePlatformStats';
import { CATEGORIES, formatCurrency } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

function formatCompact(n) {
  if (n == null) return '—';
  if (n >= 1000) return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
  return n.toLocaleString('en-US');
}

export default function HomePage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data: campaigns, isLoading, isError } = useCampaigns({
    category: activeCategory,
    search,
    status: 'active',
  });
  const { data: stats } = usePlatformStats();

  function handleSearch(e) {
    e.preventDefault();
    setSearch(searchInput);
  }

  return (
    <div className="min-h-screen bg-ink-50">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-800 to-purple-900 text-white">
        <div className="absolute inset-0 bg-mesh-hero opacity-90 pointer-events-none" />
        <div className="absolute top-20 right-10 w-64 h-64 bg-accent-500/20 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-28 lg:pt-28 lg:pb-36">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left column — copy */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md mb-6">
                <Sparkles size={14} className="text-amber-300" />
                <span>Fund the next big idea</span>
                <span className="w-1 h-1 rounded-full bg-white/40" />
                <span className="text-white/80">Trusted by creators worldwide</span>
              </div>

              <h1 className="font-display text-display-sm sm:text-display lg:text-display-lg text-white">
                Where great ideas
                <br />
                <span className="bg-gradient-to-r from-amber-300 via-accent-400 to-pink-400 bg-clip-text text-transparent">
                  meet their backers.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg text-white/75 leading-relaxed">
                Byteforce is the home for ambitious creators and the people who
                fund them. Launch a campaign in minutes — or discover the next
                breakthrough today.
              </p>

              <form onSubmit={handleSearch} className="mt-8 max-w-xl flex gap-2">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by title, category, creator…"
                    className="w-full rounded-2xl border-0 bg-white pl-11 pr-4 py-4 text-ink-900 placeholder:text-ink-400 text-sm font-medium shadow-pop focus:outline-none focus:ring-4 focus:ring-white/30"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-2xl bg-accent-500 hover:bg-accent-600 px-6 py-4 text-sm font-bold shadow-pop transition-all hover:shadow-glow-accent"
                >
                  Search
                </button>
              </form>

              <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
                {(!profile || profile.role !== 'backer') && (
                  <Button
                    size="lg"
                    onClick={() => (profile ? navigate('/campaigns/create') : navigate('/register'))}
                    className="rounded-2xl bg-white text-primary-700 hover:bg-white/95 shadow-pop"
                  >
                    <Zap size={16} className="text-accent-500" />
                    {profile ? 'Start your campaign' : 'Launch a campaign'}
                    <ArrowRight size={14} />
                  </Button>
                )}
                <Link
                  to="#campaigns"
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-all"
                >
                  Browse campaigns
                </Link>
              </div>
            </motion.div>

            {/* Right column — floating stats card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5"
            >
              <div className="relative pt-8">
                {/* Floating top badge */}
                <div className="absolute top-0 -left-5 rounded-2xl bg-white px-4 py-3 shadow-pop ring-1 ring-ink-100 flex items-center gap-3 z-10">
                  <div className="h-9 w-9 rounded-xl bg-accent-50 flex items-center justify-center">
                    <Heart size={18} className="text-accent-500 fill-accent-500" />
                  </div>
                  <div>
                    <div className="font-display text-lg font-extrabold text-ink-900 leading-none">
                      {stats?.donations_count != null ? formatCompact(stats.donations_count) : '—'}
                    </div>
                    <div className="text-xs text-ink-500 mt-0.5">donations today</div>
                  </div>
                </div>

                {/* Main stat card */}
                <div className="rounded-3xl bg-white/95 backdrop-blur-xl ring-1 ring-white/30 shadow-pop p-8 space-y-6">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-accent-600">
                      Live on Byteforce
                    </div>
                    <div className="mt-2 font-display font-extrabold text-display-sm text-ink-900">
                      {stats?.total_raised != null ? formatCurrency(stats.total_raised, true) : '—'}
                    </div>
                    <div className="text-sm text-ink-500 mt-1">total raised by creators</div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-ink-200 to-transparent" />

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: stats?.campaigns_funded, label: 'Campaigns', icon: Globe },
                      { value: stats?.backers_count,   label: 'Backers',   icon: Heart },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-2xl bg-ink-50 p-4">
                        <div className="flex items-center gap-1.5 text-ink-400 mb-1">
                          <stat.icon size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{stat.label}</span>
                        </div>
                        <div className="font-display text-2xl font-extrabold text-ink-900">
                          {formatCompact(stat.value)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-ink-500">
                    <BadgeCheck size={14} className="text-emerald-500" />
                    Verified payments via Stripe · 256-bit SSL
                  </div>
                </div>

                {/* Floating bottom badge */}
                <div className="absolute -bottom-5 right-0 rounded-2xl bg-gradient-to-br from-accent-500 to-rose-600 px-4 py-3 shadow-pop text-white flex items-center gap-2 z-10">
                  <TrendingUp size={16} />
                  <div className="text-xs font-bold">Trending up 24%</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <section className="bg-white border-b border-ink-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, label: 'Stripe-secured payments',  sub: 'PCI-compliant by default' },
              { icon: TrendingUp,  label: 'Real-time funding',         sub: 'Live progress tracking' },
              { icon: Zap,         label: 'Launch in 10 minutes',      sub: 'No hidden setup fees' },
              { icon: Globe,       label: 'Global community',          sub: 'Backers across 60+ countries' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <item.icon size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-ink-900 leading-tight">{item.label}</div>
                  <div className="text-xs text-ink-500 mt-0.5">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAMPAIGNS ── */}
      <PageWrapper id="campaigns">
        {/* Category filters */}
        <section className="mb-8 pt-4">
          <div className="flex items-end justify-between mb-5">
            <div>
              <div className="font-display text-display-xs text-ink-900">Discover campaigns</div>
              <p className="text-sm text-ink-500 mt-1">Hand-picked projects from creators around the world.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setActiveCategory('')}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                activeCategory === ''
                  ? 'bg-ink-900 text-white shadow-soft'
                  : 'bg-white border border-ink-200 text-ink-600 hover:border-ink-300 hover:text-ink-900'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value === activeCategory ? '' : cat.value)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeCategory === cat.value
                    ? 'bg-ink-900 text-white shadow-soft'
                    : 'bg-white border border-ink-200 text-ink-600 hover:border-ink-300 hover:text-ink-900'
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-extrabold text-ink-900">
                {search ? `Results for "${search}"` : activeCategory ? CATEGORIES.find(c => c.value === activeCategory)?.label : 'Active campaigns'}
              </h2>
              {campaigns && (
                <p className="text-sm text-ink-500 mt-0.5">
                  {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} live now
                </p>
              )}
            </div>
            {search && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSearch(''); setSearchInput(''); }}
              >
                Clear search
              </Button>
            )}
          </div>

          {isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-ink-100">
              <div className="h-14 w-14 rounded-2xl bg-accent-50 text-accent-500 flex items-center justify-center mb-4">
                <ShieldCheck size={26} />
              </div>
              <h3 className="text-lg font-bold text-ink-900">Couldn't load campaigns</h3>
              <p className="text-sm text-ink-500 mt-1">Check your connection and refresh.</p>
            </div>
          ) : (
            <CampaignGrid
              campaigns={campaigns}
              loading={isLoading}
              emptyIcon="🚀"
              emptyMessage={
                search
                  ? `No campaigns match "${search}". Try a different keyword.`
                  : 'No active campaigns right now. Be the first to launch one!'
              }
            />
          )}
        </section>
      </PageWrapper>
    </div>
  );
}
