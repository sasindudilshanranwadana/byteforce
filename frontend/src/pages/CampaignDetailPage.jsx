import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCampaign } from '../hooks/useCampaigns';
import { useAuth } from '../context/AuthContext';
import PageWrapper from '../components/layout/PageWrapper';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import ProgressBar from '../components/campaigns/ProgressBar';
import RewardTierCard from '../components/campaigns/RewardTierCard';
import { FullPageSpinner } from '../components/ui/Spinner';
import {
  formatCurrency,
  formatDate,
  getDaysLeft,
  getCategoryMeta,
  getFundingPercent,
  timeAgo,
} from '../lib/utils';
import { Calendar, Users, Target, ArrowLeft, Share2 } from 'lucide-react';
import { toast } from '../components/ui/Toast';

export default function CampaignDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: campaign, isLoading, isError } = useCampaign(id);
  const [selectedTier, setSelectedTier] = useState(null);

  if (isLoading) return <FullPageSpinner />;

  if (isError || !campaign) {
    return (
      <PageWrapper maxWidth="3xl">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="text-6xl mb-4">😕</span>
          <h2 className="text-2xl font-bold text-slate-900">Campaign not found</h2>
          <p className="text-slate-500 mt-2">This campaign may have been removed or doesn&apos;t exist.</p>
          <Button className="mt-6" onClick={() => navigate('/')}>Back to Discover</Button>
        </div>
      </PageWrapper>
    );
  }

  const {
    title,
    description,
    category,
    goal_amount,
    raised_amount,
    image_url,
    deadline,
    status,
    profiles,
    reward_tiers = [],
    created_at,
  } = campaign;

  const daysLeft = getDaysLeft(deadline);
  const percent = getFundingPercent(raised_amount, goal_amount);
  const catMeta = getCategoryMeta(category);

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Could not copy link');
    }
  }

  function handleBackNow() {
    if (!user) {
      navigate('/login', { state: { from: `/campaigns/${id}` } });
      return;
    }
    navigate(`/campaigns/${id}/donate`, { state: { tier: selectedTier } });
  }

  return (
    <PageWrapper>
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to campaigns
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left: main content ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero image */}
          <div className="rounded-3xl overflow-hidden aspect-[16/9] bg-slate-100">
            {image_url ? (
              <img src={image_url} alt={title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50">
                <span className="text-8xl">{catMeta.emoji}</span>
              </div>
            )}
          </div>

          {/* Title & badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className={catMeta.color}>{catMeta.emoji} {catMeta.label}</Badge>
              <Badge variant={status}>{status}</Badge>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">{title}</h1>
          </div>

          {/* Creator */}
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
            <Avatar src={profiles?.avatar_url} name={profiles?.name} size="lg" />
            <div>
              <p className="text-xs text-slate-500">Campaign by</p>
              <p className="font-semibold text-slate-900">{profiles?.name ?? 'Anonymous'}</p>
              <p className="text-xs text-slate-400">Launched {timeAgo(created_at)}</p>
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-slate max-w-none">
            <h2 className="text-lg font-bold text-slate-900 mb-3">About this campaign</h2>
            <div className="text-slate-600 whitespace-pre-wrap leading-relaxed text-sm">
              {description}
            </div>
          </div>

          {/* Reward tiers */}
          {reward_tiers.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4">Choose a Reward</h2>
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
            </div>
          )}
        </div>

        {/* ── Right: sticky sidebar ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 space-y-5">
              {/* Raised */}
              <div>
                <p className="text-3xl font-extrabold text-slate-900">
                  {formatCurrency(raised_amount)}
                </p>
                <p className="text-sm text-slate-500 mt-0.5">
                  raised of <span className="font-semibold text-slate-700">{formatCurrency(goal_amount)}</span> goal
                </p>
              </div>

              <ProgressBar raised={raised_amount} goal={goal_amount} />

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-100">
                <div>
                  <p className="text-xl font-bold text-slate-900">{percent}%</p>
                  <p className="text-xs text-slate-500">funded</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">
                    {daysLeft > 0 ? daysLeft : 'Ended'}
                  </p>
                  <p className="text-xs text-slate-500">{daysLeft > 0 ? 'days left' : ''}</p>
                </div>
              </div>

              {/* Deadline */}
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Calendar size={14} className="text-primary-500" />
                Deadline: <span className="font-medium text-slate-700">{formatDate(deadline)}</span>
              </div>

              {/* CTA */}
              {status === 'active' && daysLeft > 0 ? (
                <Button fullWidth size="lg" onClick={handleBackNow}>
                  {selectedTier
                    ? `Back at ${formatCurrency(selectedTier.minimum_amount)}+`
                    : 'Back This Campaign'}
                </Button>
              ) : (
                <div className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm text-slate-500 font-medium">
                  {daysLeft === 0 ? 'This campaign has ended' : `Campaign is ${status}`}
                </div>
              )}

              {selectedTier && (
                <p className="text-xs text-center text-slate-400">
                  Selected: <span className="font-semibold">{selectedTier.title}</span>
                </p>
              )}

              {/* Share */}
              <button
                onClick={handleShare}
                className="flex w-full items-center justify-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors"
              >
                <Share2 size={14} />
                Share this campaign
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
