/**
 * payments.js
 * Handles Stripe PaymentIntent creation and webhook processing.
 * All DB operations use the Supabase service-role client.
 */
require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// ─── Clients ─────────────────────────────────────────────────────────────────
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

// Service-role client bypasses RLS — only used server-side
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── Helper: verify Supabase JWT and return user ──────────────────────────────
async function getUserFromToken(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

// ─── POST /api/payments/checkout ─────────────────────────────────────────────
router.post('/checkout', async (req, res, next) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized — valid Supabase JWT required' });
    }

    const { campaign_id, amount, reward_tier_id } = req.body;

    if (!campaign_id || !amount || typeof amount !== 'number' || amount < 1) {
      return res.status(400).json({ error: 'campaign_id and a positive numeric amount are required' });
    }

    // Verify campaign exists and is active
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .select('id, title, status')
      .eq('id', campaign_id)
      .single();

    if (campaignError || !campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    if (campaign.status !== 'active') {
      return res.status(400).json({ error: 'Campaign is not accepting donations' });
    }

    // Verify reward tier belongs to campaign (if provided)
    if (reward_tier_id) {
      const { data: tier, error: tierError } = await supabaseAdmin
        .from('reward_tiers')
        .select('id, minimum_amount')
        .eq('id', reward_tier_id)
        .eq('campaign_id', campaign_id)
        .single();

      if (tierError || !tier) {
        return res.status(404).json({ error: 'Reward tier not found for this campaign' });
      }
      if (amount < tier.minimum_amount) {
        return res.status(400).json({
          error: `Amount must be at least $${tier.minimum_amount} for this reward tier`,
        });
      }
    }

    // Create Stripe PaymentIntent (amount in cents)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: {
        campaign_id,
        backer_id: user.id,
        reward_tier_id: reward_tier_id || '',
      },
      description: `Donation to: ${campaign.title}`,
    });

    // Create pending donation in Supabase
    const { data: donation, error: donationError } = await supabaseAdmin
      .from('donations')
      .insert({
        backer_id: user.id,
        campaign_id,
        reward_tier_id: reward_tier_id || null,
        amount,
        status: 'pending',
        stripe_payment_intent_id: paymentIntent.id,
      })
      .select()
      .single();

    if (donationError) {
      // Roll back PaymentIntent if DB insert fails
      await stripe.paymentIntents.cancel(paymentIntent.id).catch(() => {});
      throw new Error(`Failed to create donation record: ${donationError.message}`);
    }

    res.status(201).json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      donation_id: donation.id,
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/payments/webhook (raw body, mounted in server.js) ──────────────
async function webhookHandler(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        const { error } = await supabaseAdmin
          .from('donations')
          .update({ status: 'completed' })
          .eq('stripe_payment_intent_id', pi.id);

        if (error) {
          console.error('[Webhook] Failed to update donation to completed:', error.message);
        } else {
          console.log(`[Webhook] Donation completed for PaymentIntent ${pi.id}`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object;
        const { error } = await supabaseAdmin
          .from('donations')
          .update({ status: 'failed' })
          .eq('stripe_payment_intent_id', pi.id);

        if (error) {
          console.error('[Webhook] Failed to update donation to failed:', error.message);
        } else {
          console.log(`[Webhook] Donation failed for PaymentIntent ${pi.id}`);
        }
        break;
      }

      default:
        // Unhandled event types — acknowledge receipt
        break;
    }
  } catch (err) {
    console.error('[Webhook] Handler error:', err.message);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }

  res.json({ received: true });
}

module.exports = { router, webhookHandler };
