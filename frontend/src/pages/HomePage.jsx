import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Shield, Zap } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper';
import CampaignGrid from '../components/campaigns/CampaignGrid';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useCampaigns } from '../hooks/useCampaigns';
import { CATEGORIES } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

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

  function handleSearch(e) {
    e.preventDefault();
    setSearch(searchInput);
  }

  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-purple-700 text-white">
        {/* decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-900/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white/90 mb-6 backdrop-blur-sm">
            <Zap size={14} className="text-yellow-300" />
            Fund the future. Back bold ideas.
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
            Where Great Ideas
            <br />
            <span className="text-yellow-300">Find Their Backers</span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-lg text-white/80 leading-relaxed">
            Byteforce connects passionate creators with a community of backers.
            Launch your campaign or discover the next big thing — from tech breakthroughs
            to creative projects.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mt-8 max-w-xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search campaigns..."
                className="w-full rounded-2xl border-0 bg-white/95 pl-11 pr-4 py-3.5 text-slate-900 placeholder:text-slate-400 text-sm font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <Button type="submit" size="lg" variant="secondary" className="rounded-2xl shrink-0">
              Search
            </Button>
          </form>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { label: 'Campaigns Funded', value: '2,400+' },
              { label: 'Backers Worldwide', value: '84K+' },
              { label: 'Total Raised', value: '$12M+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-extrabold">{stat.value}</div>
                <div className="text-xs text-white/70 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA for campaigners */}
          {(!profile || profile.role !== 'backer') && (
            <div className="mt-8">
              <Button
                variant="secondary"
                size="lg"
                className="rounded-2xl shadow-lg"
                onClick={() =>
                  profile
                    ? navigate('/campaigns/create')
                    : navigate('/register')
                }
              >
                <Zap size={18} className="text-primary-600" />
                {profile ? 'Start Your Campaign' : 'Launch a Campaign'}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
            {[
              { icon: <Shield size={16} />, text: 'Secure payments via Stripe' },
              { icon: <TrendingUp size={16} />, text: 'Real-time funding progress' },
              { icon: <Zap size={16} />, text: 'Fast campaign launches' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-slate-400">
                <span className="text-primary-500">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageWrapper>
        {/* ── Category filters ── */}
        <section className="mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setActiveCategory('')}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeCategory === ''
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-600'
              }`}
            >
              All Categories
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value === activeCategory ? '' : cat.value)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeCategory === cat.value
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-600'
                }`}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Campaign grid ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {search ? `Results for "${search}"` : activeCategory ? CATEGORIES.find(c => c.value === activeCategory)?.label : 'Active Campaigns'}
              </h2>
              {campaigns && (
                <p className="text-sm text-slate-500 mt-0.5">
                  {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} found
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
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-5xl mb-4">⚠️</span>
              <h3 className="text-lg font-semibold text-slate-800">Failed to load campaigns</h3>
              <p className="text-sm text-slate-500 mt-1">Please check your connection and try again.</p>
            </div>
          ) : (
            <CampaignGrid
              campaigns={campaigns}
              loading={isLoading}
              emptyIcon={search ? '🔍' : '🚀'}
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
