import { useEffect } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCampaign } from '../hooks/useCampaigns';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import { formatCurrency } from '../lib/utils';
import { Heart, ArrowRight, Share2 } from 'lucide-react';

export default function DonationSuccessPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: campaign } = useCampaign(id);

  const amount = parseFloat(searchParams.get('amount') || '0');
  const tierName = searchParams.get('tier');

  // If user lands here without amount param, redirect to campaign
  useEffect(() => {
    if (!searchParams.get('amount')) {
      navigate(`/campaigns/${id}`, { replace: true });
    }
  }, [id, navigate, searchParams]);

  function handleShare() {
    const url = `${window.location.origin}/campaigns/${id}`;
    if (navigator.share) {
      navigator.share({ title: campaign?.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
    }
  }

  return (
    <PageWrapper maxWidth="lg">
      <div className="flex flex-col items-center text-center py-16">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 blur-3xl opacity-30 rounded-full scale-150" />
          <div className="relative h-24 w-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-pop">
            <Heart size={40} fill="white" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="font-display text-display-sm font-extrabold text-ink-900 mb-3">
            Thank you for backing!
          </h1>

          {amount > 0 && (
            <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-100 px-5 py-3 mb-4">
              <span className="text-sm font-medium text-emerald-700">Your pledge</span>
              <span className="font-display text-2xl font-extrabold text-emerald-600">
                {formatCurrency(amount)}
              </span>
            </div>
          )}

          {tierName && (
            <p className="text-sm text-ink-600 mb-2">
              Reward tier: <span className="font-semibold text-ink-900">{tierName}</span>
            </p>
          )}

          {campaign && (
            <p className="text-ink-500 mb-8 max-w-sm">
              Your support helps <span className="font-semibold text-ink-700">{campaign.title}</span> reach its goal.
              You&apos;ll receive updates from the creator as the project progresses.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleShare}
              variant="secondary"
              className="gap-2"
            >
              <Share2 size={16} /> Share this campaign
            </Button>
            <Link to={`/campaigns/${id}`}>
              <Button className="gap-2 w-full sm:w-auto">
                View campaign <ArrowRight size={16} />
              </Button>
            </Link>
          </div>

          <div className="mt-8">
            <Link to="/" className="text-sm text-ink-500 hover:text-primary-700 transition-colors">
              Discover more campaigns →
            </Link>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
