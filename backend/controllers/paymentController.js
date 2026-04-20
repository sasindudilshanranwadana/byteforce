const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Donation, Payment, Campaign } = require('../models');
const nodemailer = require('nodemailer');

// POST /api/payments/checkout — initiate donation (SCRUM-20)
const checkout = async (req, res, next) => {
  try {
    const { campaignId, amount, rewardTierId } = req.body;
    const campaign = await Campaign.findByPk(campaignId);
    if (!campaign || campaign.status !== 'active')
      return res.status(400).json({ message: 'Campaign is not active.' });

    // Create donation record (pending)
    const donation = await Donation.create({
      backerId: req.user.id, campaignId, amount, status: 'pending', rewardTierId: rewardTierId || null,
    });

    // Create Stripe PaymentIntent (sandbox)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency: 'aud',
      metadata: { donationId: donation.id, campaignId, backerId: req.user.id },
    });

    await Payment.create({
      donationId: donation.id, gateway: 'stripe',
      transactionId: paymentIntent.id, amount, status: 'pending',
    });

    res.json({ clientSecret: paymentIntent.client_secret, donationId: donation.id });
  } catch (err) { next(err); }
};

// POST /api/payments/webhook — Stripe webhook confirmation
const webhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ message: `Webhook error: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    const { donationId, campaignId } = pi.metadata;
    await Donation.update({ status: 'completed' }, { where: { id: donationId } });
    await Payment.update({ status: 'success', processedAt: new Date() }, { where: { transactionId: pi.id } });
    await Campaign.increment('raisedAmount', { by: pi.amount / 100, where: { id: campaignId } });
    // Send confirmation email (async — fire and forget)
    sendConfirmationEmail(donationId).catch(console.error);
  } else if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object;
    await Donation.update({ status: 'failed' }, { where: { id: pi.metadata.donationId } });
    await Payment.update({ status: 'failed' }, { where: { transactionId: pi.id } });
  }
  res.json({ received: true });
};

const sendConfirmationEmail = async (donationId) => {
  const { Donation, User, Campaign } = require('../models');
  const donation = await Donation.findByPk(donationId, {
    include: [{ model: User, as: 'backer' }, { model: Campaign, as: 'campaign' }],
  });
  if (!donation) return;
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, port: process.env.EMAIL_PORT,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
  });
  await transporter.sendMail({
    from: `"Byteforce Crowdfunding" <${process.env.EMAIL_USER}>`,
    to: donation.backer.email,
    subject: `Thank you for supporting "${donation.campaign.title}"!`,
    html: `<h2>Donation Confirmed</h2><p>Hi ${donation.backer.name},</p>
           <p>Your donation of <strong>$${donation.amount} AUD</strong> to
           <strong>${donation.campaign.title}</strong> has been received.</p>
           <p>Thank you for your support!</p><p>— Team Byteforce</p>`,
  });
};

module.exports = { checkout, webhook };
