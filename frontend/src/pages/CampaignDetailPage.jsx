import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCampaign, useCampaignDonations } from '../hooks/useCampaigns';
import { useAuth } from '../context/AuthContext';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import RewardTierCard from '../components/campaigns/RewardTierCard';
import CampaignUpdates from '../components/campaigns/CampaignUpdates';
import ShareCampaignButton from '../components/campaigns/ShareCampaignButton';
import { FullPageSpinner } from '../components/ui/Spinner';
import {
  formatCurrency, formatDate, getDaysLeft, getCategoryMeta,
  getFundingPercent, timeAgo,
} from '../lib/utils';
import {
  Calendar, Users, Target, ArrowLeft, BadgeCheck, Heart, Flag,
  TrendingUp, Clock, Gift, MessageCircle, Pencil,
} from 'lucide-react';

const TABS = [
  { id: 'story',   label: 'Story',    icon: MessageCircle },
  { id: 'rewards', label: 'Rewards',  icon: Gift },
  { id: 'updates', label: 'Updates',  icon: TrendingUp },
  { id: 'backers', label: 'Backers',  icon: Users },
];

export default function CampaignDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile, isAdmin } = useAuth();
  const { data: campaign, isLoading, isError } = useCampaign(id);
  const { data: donations = [] } = useCampaignDonations(id);
  const [selectedTier, setSelectedTier] = useState(null);
  const [activeTab, setActiveTab] = useState('story');

  if (isLoading) return <FullPageSpinner />;

  if (isError || !campaign) {
    return (
      <PageWrapper maxWidth="3xl">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-2xl bg-accent-50 text-accent-500 flex items-center justify-center mb-4">
            <Flag size={28} />
          </div>
          <h2 className="font-display text-2xl font-extrabold text-ink-900">Campaign not found</h2>
          <p className="text-ink-500 mt-2">This campaign may have been removed or doesn&apos;t exist.</p>
          <Button className="mt-6" onClick={() => navigate('/')}>Back to discover</Button>
        </div>
      </PageWrapper>
    );
  }

  const {
    title, description, category, goal_amount, raised_amount,
    image_url, deadline, status, profiles, reward_tiers = [], created_at,
  } = campaign;

  const daysLeft = getDaysLeft(deadline);
  const percent = getFundingPercent(raised_amount, goal_amount);
  const catMeta = getCategoryMeta(category);
  const isFullyFunded = percent >= 100;
  const backersCount = new Set(donations.filter(d => d.status === 'completed').map(d => d.backer_id)).size;

  function handleBackNow() {
    if (!user) {
      navigate('/login', { state: { from: `/campaigns/${id}` } });
      return;
    }
    navigate(`/campaigns/${id}/donate`, { state: { tier: selectedTier } });
  }

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Hero band */}
      <div className="relative bg-gradient-to-br from-primary-700 via-primary-800 to-purple-900 text-white">
        <div className="absolute inset-0 bg-mesh-hero opacity-80 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={16} /> Back to campaigns
          </Link>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/20 px-3 py-1 text-xs font-bold">
              {catMeta.emoji} {catMeta.label}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
              status === 'active'  ? 'bg-emerald-500/20 ring-1 ring-emerald-300/40 text-emerald-200'
              : status === 'pending'  ? 'bg-amber-500/20 ring-1 ring-amber-300/40 text-amber-200'
              : status === 'closed'   ? 'bg-teal-500/20 ring-1 ring-teal-300/40 text-teal-200'
              : 'bg-white/10 ring-1 ring-white/20 text-white/70'
            }`}>
              {status === 'closed' ? '✓ Completed' : status}
            </span>
            {isFullyFunded && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold">
                <BadgeCheck size={12} /> Fully Funded
              </span>
            )}
            {/* Edit button — visible to creator and admins */}
            {(profile?.id === campaign.creator_id || isAdmin) && (status === 'active' || status === 'pending') && (
              <Link
                to={`/campaigns/${id}/edit`}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 ring-1 ring-white/30 hover:bg-white/25 px-3 py-1 text-xs font-bold text-white transition-colors"
              >
                <Pencil size={11} /> Edit Campaign
              </Link>
            )}
          </div>
          <h1 className="font-display text-display-xs sm:text-display-sm md:text-display text-white max-w-4xl">
            {title}
          </h1>
          <div className="mt-5 flex items-center gap-3 text-sm text-white/70">
            <Avatar src={profiles?.avatar_url} name={profiles?.name} size="sm" />
            <span>by <span className="font-bold text-white">{profiles?.name ?? 'Anonymous'}</span></span>
            <span>·</span>
            <span>Launched {timeAgo(created_at)}</span>
          </div>
        </div>
      </div>

      <PageWrapper>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 -mt-8 relative z-10">
          {/* ── Left: hero image + tabs ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-3xl overflow-hidden aspect-[16/9] bg-ink-100 shadow-pop"
            >
              {image_url ? (
                <img src={image_url} alt={title} className="h-full w-full object-cover" />
              ) : (
                <div className={`relative h-full w-full bg-gradient-to-br ${catMeta.gradient}`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.35),transparent_55%)]" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <span className="text-9xl drop-shadow-2xl">{catMeta.emoji}</span>
                    <span className="mt-4 text-sm font-bold tracking-[0.3em] uppercase opacity-90">{catMeta.label}</span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Tabs */}
            <div className="bg-white rounded-3xl border border-ink-100 shadow-card">
              <div className="border-b border-ink-100 px-2 sm:px-4 overflow-x-auto">
                <div className="flex items-center gap-1 min-w-max">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative flex items-center gap-2 px-4 py-4 text-sm font-semibold transition-colors ${
                          active ? 'text-primary-700' : 'text-ink-500 hover:text-ink-900'
                        }`}
                      >
                        <Icon size={15} />
                        {tab.label}
                        {tab.id === 'rewards' && reward_tiers.length > 0 && (
                          <span className="ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary-100 px-1 text-[10px] font-bold text-primary-700">
                            {reward_tiers.length}
                          </span>
                        )}
                        {active && (
                          <motion.div
                            layoutId="active-tab-underline"
                            className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary-600 rounded-full"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === 'story' && (
                      <div className="prose prose-slate max-w-none">
                        <h2 className="font-display text-xl font-extrabold text-ink-900 mb-4">About this campaign</h2>
                        <div className="text-ink-600 whitespace-pre-wrap leading-relaxed text-sm">
                          {description || 'The creator hasn\'t added a description yet.'}
                        </div>
                      </div>
                    )}

                    {activeTab === 'rewards' && (
                      <div>
                        <h2 className="font-display text-xl font-extrabold text-ink-900 mb-4">Choose a reward</h2>
                        {reward_tiers.length > 0 ? (
                          <div className="space-y-3">
                            {reward_tiers
                              .sort((a, b) => a.minimum_amount - b.minimum_amount)
                              .map((tier) => (
                                <RewardTierCard
                                  key={tier.id}
                                  tier={tier}
                                  selected={selectedTier?.id === tier.id}
                                  onSelect={(t) => setSelectedTier(selectedTier?.id === t.id ? null : t)}
                                  disabled={status !== 'active' || daysLeft === 0}
                                />
                              ))}
                          </div>
                        ) : (
                          <div className="text-center py-10 text-sm text-ink-500">
                            <Gift size={28} className="mx-auto mb-3 text-ink-300" />
                            This campaign doesn&apos;t offer reward tiers — back any amount you like.
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'updates' && (
                      <CampaignUpdates campaign={campaign} />
                    )}

                    {activeTab === 'backers' && (
                      <div>
                        <h2 className="font-display text-xl font-extrabold text-ink-900 mb-4">Recent backers</h2>
                        {donations.filter(d => d.status === 'completed').length === 0 ? (
                          <div className="text-center py-10 text-sm text-ink-500">
                            <Users size={28} className="mx-auto mb-3 text-ink-300" />
                            No backers yet — be the first to support this campaign.
                          </div>
                        ) : (
                          <ul className="divide-y divide-ink-100">
                            {donations
                              .filter(d => d.status === 'completed')
                              .slice(0, 12)
                              .map((d) => (
                                <li key={d.id} className="flex items-center justify-between py-3">
                                  <div className="flex items-center gap-3">
                                    <Avatar name={d.profiles?.name} size="sm" />
                                    <div>
                                      <div className="text-sm font-semibold text-ink-900">
                                        {d.profiles?.name ?? 'Anonymous backer'}
                                      </div>
                                      <div className="text-xs text-ink-500">{timeAgo(d.created_at)}</div>
                                    </div>
                                  </div>
                                  <div className="font-display font-extrabold text-ink-900">
                                    {formatCurrency(d.amount)}
                                  </div>
                                </li>
                              ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ── Right: sticky donate sidebar ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-3xl bg-white border border-ink-100 shadow-pop p-6 space-y-5">
                {/* Raised */}
                <div>
                  <div className="font-display text-display-xs font-extrabold text-ink-900 leading-none">
                    {formatCurrency(raised_amount)}
                  </div>
                  <p className="text-sm text-ink-500 mt-1.5">
                    raised of <span className="font-bold text-ink-700">{formatCurrency(goal_amount)}</span> goal
                  </p>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="h-2.5 rounded-full bg-ink-100 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percent, 100)}%` }}
                      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                      className={`h-full rounded-full bg-gradient-to-r ${
                        isFullyFunded
                          ? 'from-emerald-400 to-emerald-600'
                          : 'from-primary-500 via-primary-600 to-accent-500'
                      }`}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-xs">
                    <span className="font-bold text-ink-900">{percent}% funded</span>
                    {daysLeft > 0 && <span className="text-ink-500">{daysLeft} day{daysLeft !== 1 ? 's' : ''} left</span>}
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-ink-50 p-3">
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-ink-400 mb-1">
                      <Users size={11} /> Backers
                    </div>
                    <div className="font-display text-xl font-extrabold text-ink-900">{backersCount}</div>
                  </div>
                  <div className="rounded-2xl bg-ink-50 p-3">
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-ink-400 mb-1">
                      <Clock size={11} /> Days left
                    </div>
                    <div className="font-display text-xl font-extrabold text-ink-900">
                      {daysLeft > 0 ? daysLeft : '—'}
                    </div>
                  </div>
                </div>

                {/* Deadline */}
                <div className="flex items-center gap-2 text-xs text-ink-500 border-t border-ink-100 pt-4">
                  <Calendar size={12} className="text-primary-500" />
                  Closes on <span className="font-bold text-ink-700">{formatDate(deadline)}</span>
                </div>

                {/* CTA */}
                {status === 'active' && daysLeft > 0 ? (
                  <Button
                    fullWidth
                    size="lg"
                    onClick={handleBackNow}
                    className="bg-accent-500 hover:bg-accent-600 text-white shadow-glow-accent hover:shadow-pop"
                  >
                    <Heart size={16} className="fill-white" />
                    {selectedTier
                      ? `Back at ${formatCurrency(selectedTier.minimum_amount)}+`
                      : 'Back this campaign'}
                  </Button>
                ) : (
                  <div className="rounded-2xl bg-ink-100 px-4 py-3 text-center text-sm text-ink-500 font-semibold">
                    {daysLeft === 0 ? 'This campaign has ended' : `Campaign is ${status}`}
                  </div>
                )}

                {selectedTier && (
                  <p className="text-xs text-center text-ink-500">
                    Selected: <span className="font-bold text-ink-700">{selectedTier.title}</span>
                  </p>
                )}

                {/* Share */}
                <ShareCampaignButton campaign={campaign} />
              </div>

              {/* Trust card */}
              <div className="rounded-3xl bg-white border border-ink-100 shadow-card p-5">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <BadgeCheck size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-ink-900">Backed by Stripe</div>
                    <div className="text-xs text-ink-500 mt-0.5 leading-relaxed">
                      Payments are processed securely with 256-bit SSL. Your card is never stored on our servers.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}
