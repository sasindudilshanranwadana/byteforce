const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { processPendingNotifications } = require('../services/mailer');

const router = express.Router();

const getSupabase = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
};

async function getUserFromToken(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

// POST /api/notifications/send-emails
router.post('/send-emails', async (req, res, next) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized — valid Supabase JWT required' });
    const { processed, failed } = await processPendingNotifications({ batchSize: 50 });
    res.json({ ok: true, processed, failed });
  } catch (err) { next(err); }
});

// GET /api/notifications/pending-count
router.get('/pending-count', async (req, res, next) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized — valid Supabase JWT required' });
    const sb = getSupabase();
    if (!sb) return res.status(500).json({ error: 'Server configuration error' });
    const { count, error } = await sb
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    if (error) return res.status(500).json({ error: error.message });
    res.json({ pending: count });
  } catch (err) { next(err); }
});

module.exports = router;
