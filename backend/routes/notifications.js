/**
 * notifications.js
 * Exposes an HTTP endpoint that triggers the email mailer worker.
 * POST /api/notifications/send-emails — drains the pending notifications queue.
 * Requires a valid Supabase JWT (admin only in production; any auth in dev).
 */
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { processPendingNotifications } = require('../services/mailer');

const router = express.Router();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getUserFromToken(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

// POST /api/notifications/send-emails
// Drains the pending notifications queue and sends emails via Nodemailer.
// Caller must be authenticated. In production, restrict to admin role or a cron secret.
router.post('/send-emails', async (req, res, next) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized — valid Supabase JWT required' });
    }

    const { processed, failed } = await processPendingNotifications({ batchSize: 50 });
    res.json({ ok: true, processed, failed });
  } catch (err) {
    next(err);
  }
});

// GET /api/notifications/pending-count
// Returns the number of pending email notifications in the queue.
router.get('/pending-count', async (req, res, next) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized — valid Supabase JWT required' });
    }

    const { count, error } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ pending: count });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
// notifications.js — drain route for queued email notifications
