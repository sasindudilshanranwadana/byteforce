import { useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCampaign } from '../hooks/useCampaigns';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { stripePromise } from '../lib/stripe';
import PageWrapper from '../components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import RewardTierCard from '../components/campaigns/RewardTierCard';
import { FullPageSpinner } from '../components/ui/Spinner';
import { toast } from '../components/ui/Toast';
import { formatCurrency, formatDate, getDaysLeft } from '../lib/utils';
import { ArrowLeft, Heart, Lock, CheckCircle } from 'lucide-react';

// ─── Step 1: Amount selection ─────────────────────────────────────────────────
function AmountStep({ campaign, onNext }) {
  const { reward_tiers = [] } = campaign;
  const location = useLocation();
  const [selectedTier, setSelectedTier] = useState(location.state?.tier ?? null);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const QUICK_AMOUNTS = [10, 25, 50, 100, 250];
  const effectiveAmount = selectedTier
    ? Math.max(selectedTier.minimum_amount, parseFloat(customAmount) || selectedTier.minimum_amount)
    : parseFloat(customAmount) || 0;

  async function handleProceed() {
    if (!user) {
      navigate('/login', { state: { from: `/campaigns/${id}/donate` } });
      return;
    }
    if (effectiveAmount < 1) {
      toast.error('Please enter an amount of at least $1');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          campaign_id: campaign.id,
          amount: effectiveAmount,
          reward_tier_id: selectedTier?.id ?? null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to initiate payment');

      onNext({ clientSecret: data.client_secret, amount: effectiveAmount, tier: selectedTier });
    } catch (err) {
      toast.error(err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Back this campaign</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {reward_tiers.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Choose a reward tier (optional)</p>
            {reward_tiers
              .sort((a, b) => a.minimum_amount - b.minimum_amount)
              .map((tier) => (
                <RewardTierCard
                  key={tier.id}
                  tier={tier}
                  selected={selectedTier?.id === tier.id}
                  onSelect={(t) => {
                    setSelectedTier(selectedTier?.id === t.id ? null : t);
                    if (!customAmount) setCustomAmount(String(t.minimum_amount));
                  }}
                />
              ))}
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Quick select amount</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setCustomAmount(String(amt))}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
                  parseFloat(customAmount) === amt
                    ? 'border-primary-600 bg-primary-50 text-primary-600'
                    : 'border-slate-200 text-slate-700 hover:border-primary-300 hover:bg-primary-50'
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Custom amount ($)
          </label>
          <input
            type="number"
            placeholder="Enter your own amount"
            min={selectedTier ? selectedTier.minimum_amount : 1}
            step="0.01"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {selectedTier && (
            <p className="mt-1 text-xs text-slate-400">
              Minimum {formatCurrency(selectedTier.minimum_amount)} for this tier
            </p>
          )}
        </div>

        {effectiveAmount > 0 && (
          <div className="rounded-2xl bg-primary-50 border border-primary-100 p-4 flex items-center justify-between">
            <span className="text-sm font-medium text-primary-700">Your pledge</span>
            <span className="text-2xl font-extrabold text-primary-600">
              {formatCurrency(effectiveAmount)}
            </span>
          </div>
        )}

        <Button
          fullWidth
          size="lg"
          loading={loading}
          onClick={handleProceed}
          disabled={effectiveAmount < 1}
        >
          <Heart size={16} />
          Continue to Payment {effectiveAmount >= 1 ? `— ${formatCurrency(effectiveAmount)}` : ''}
        </Button>

        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <Lock size={12} />
          Payments are secure and encrypted via Stripe
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Step 2: Stripe card form ─────────────────────────────────────────────────
function PaymentStep({ amount, onBack, campaignId }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleConfirm(e) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/campaigns/${campaignId}?donated=true`,
        },
        redirect: 'if_required',
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Thank you! Your donation was successful 🎉', { duration: 6000 });
      navigate(`/campaigns/${campaignId}`, { replace: true });
    } catch (err) {
      toast.error(err.message ?? 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-2xl bg-primary-50 border border-primary-100 p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-primary-700">Donating</span>
          <span className="text-2xl font-extrabold text-primary-600">
            {formatCurrency(amount)}
          </span>
        </div>

        <form onSubmit={handleConfirm} className="space-y-5">
          <div className="rounded-xl border border-slate-200 p-4">
            <PaymentElement />
          </div>

          <Button type="submit" fullWidth size="lg" loading={loading} disabled={!stripe || !elements}>
            <Lock size={16} />
            Confirm Donation — {formatCurrency(amount)}
          </Button>
        </form>

        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors mx-auto"
        >
          <ArrowLeft size={14} /> Change amount
        </button>

        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <Lock size={12} />
          256-bit SSL encryption · Powered by Stripe
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DonatePage() {
  const { id } = useParams();
  const { data: campaign, isLoading } = useCampaign(id);
  const navigate = useNavigate();
  const [step, setStep] = useState('amount'); // 'amount' | 'payment'
  const [paymentData, setPaymentData] = useState(null);

  if (isLoading) return <FullPageSpinner />;
  if (!campaign) {
    return (
      <PageWrapper maxWidth="2xl">
        <div className="text-center py-20">
          <span className="text-5xl">😕</span>
          <h2 className="text-xl font-bold mt-4">Campaign not found</h2>
          <Button className="mt-4" onClick={() => navigate('/')}>Home</Button>
        </div>
      </PageWrapper>
    );
  }

  const { title, goal_amount, raised_amount, deadline } = campaign;
  const daysLeft = getDaysLeft(deadline);

  function handleAmountNext(data) {
    setPaymentData(data);
    setStep('payment');
  }

  return (
    <PageWrapper maxWidth="2xl">
      <Link
        to={`/campaigns/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to campaign
      </Link>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-6">
        {['Select Amount', 'Enter Payment'].map((label, i) => {
          const isActive = (i === 0 && step === 'amount') || (i === 1 && step === 'payment');
          const isDone = i === 0 && step === 'payment';
          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isActive
                    ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {isDone ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${isActive ? 'text-primary-600' : isDone ? 'text-emerald-600' : 'text-slate-400'}`}>
                {label}
              </span>
              {i === 0 && <div className={`w-8 h-0.5 mx-1 ${step === 'payment' ? 'bg-primary-600' : 'bg-slate-200'}`} />}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left: form */}
        <div className="md:col-span-3">
          {step === 'amount' && (
            <AmountStep campaign={campaign} onNext={handleAmountNext} />
          )}

          {step === 'payment' && paymentData && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: paymentData.clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: { colorPrimary: '#7c3aed', borderRadius: '12px' },
                },
              }}
            >
              <PaymentStep
                amount={paymentData.amount}
                campaignId={id}
                onBack={() => setStep('amount')}
              />
            </Elements>
          )}
        </div>

        {/* Right: campaign summary */}
        <div className="md:col-span-2">
          <Card>
            <CardContent className="pt-6">
              {campaign.image_url ? (
                <img
                  src={campaign.image_url}
                  alt={title}
                  className="rounded-xl w-full aspect-video object-cover mb-4"
                />
              ) : (
                <div className="rounded-xl bg-primary-50 w-full aspect-video flex items-center justify-center mb-4 text-5xl">
                  💡
                </div>
              )}
              <h3 className="font-bold text-slate-900 line-clamp-2">{title}</h3>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Raised</span>
                  <span className="font-semibold">{formatCurrency(raised_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Goal</span>
                  <span className="font-semibold">{formatCurrency(goal_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Deadline</span>
                  <span className="font-semibold">{formatDate(deadline)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Days left</span>
                  <span className="font-semibold text-primary-600">{daysLeft}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
