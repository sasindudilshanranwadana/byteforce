require('dotenv').config();
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

const getSupabase = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
};

const getTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const FROM_ADDRESS = () => process.env.MAIL_FROM || 'Byteforce <noreply@byteforce.com>';
const APP_URL = () => process.env.CLIENT_URL || 'http://localhost:5173';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderEmailHtml({ subject, body, campaign_id }) {
  const campaignLink = campaign_id ? `${APP_URL()}/campaigns/${campaign_id}` : APP_URL();
  return `<!doctype html>
<html><body style="font-family:system-ui,sans-serif;background:#f8fafc;margin:0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;padding:32px;">
    <div style="text-align:center;margin-bottom:24px;">
      <strong style="color:#7c3aed;font-size:20px;">Byteforce</strong>
    </div>
    <h1 style="font-size:22px;color:#0f172a;">${escapeHtml(subject)}</h1>
    <div style="color:#334155;line-height:1.6;white-space:pre-line;">${escapeHtml(body)}</div>
    <div style="text-align:center;margin-top:28px;">
      <a href="${campaignLink}" style="background:#7c3aed;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:600;display:inline-block;">View Campaign</a>
    </div>
    <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:32px;">
      You're receiving this because you backed a campaign on Byteforce.
    </p>
  </div>
</body></html>`;
}

async function getRecipientEmail(userId) {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.auth.admin.getUserById(userId);
  if (error || !data?.user?.email) return null;
  return data.user.email;
}

async function processPendingNotifications({ batchSize = 25 } = {}) {
  const sb = getSupabase();
  if (!sb) return { processed: 0, failed: 0 };

  const { data: pending, error } = await sb
    .from('notifications')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(batchSize);

  if (error) {
    console.error('[Mailer] Failed to fetch pending notifications:', error.message);
    return { processed: 0, failed: 0 };
  }
  if (!pending?.length) return { processed: 0, failed: 0 };

  const transporter = getTransporter();
  let processed = 0, failed = 0;

  for (const n of pending) {
    const email = await getRecipientEmail(n.user_id);
    if (!email) {
      await sb.from('notifications').update({ status: 'failed', error: 'Recipient email not found' }).eq('id', n.id);
      failed++;
      continue;
    }
    try {
      await transporter.sendMail({
        from: FROM_ADDRESS(),
        to: email,
        subject: n.subject,
        html: renderEmailHtml(n),
        text: `${n.subject}\n\n${n.body}\n\n${APP_URL()}/campaigns/${n.campaign_id ?? ''}`,
      });
      await sb.from('notifications').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', n.id);
      processed++;
    } catch (err) {
      console.error(`[Mailer] Send failed for notification ${n.id}:`, err.message);
      await sb.from('notifications').update({ status: 'failed', error: err.message }).eq('id', n.id);
      failed++;
    }
  }
  return { processed, failed };
}

// Standalone worker entry point
if (require.main === module) {
  const intervalMs = Number(process.env.MAILER_INTERVAL_MS || 30000);
  console.log(`[Mailer] Worker started — polling every ${intervalMs}ms`);
  const tick = async () => {
    try {
      const { processed, failed } = await processPendingNotifications();
      if (processed || failed) console.log(`[Mailer] Sent ${processed}, failed ${failed}`);
    } catch (err) {
      console.error('[Mailer] Tick error:', err.message);
    }
  };
  tick();
  setInterval(tick, intervalMs);
}

module.exports = { processPendingNotifications };
