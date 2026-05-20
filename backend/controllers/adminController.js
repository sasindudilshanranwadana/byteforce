const getSupabase = require('../config/supabase');

// GET /api/admin/campaigns — all campaigns with filter (SCRUM-26)
const getAllCampaigns = async (req, res, next) => {
  try {
    const sb = getSupabase();
    const { status } = req.query;
    let query = sb
      .from('campaigns')
      .select('*, profiles(id, name, email)')
      .order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);

    const { data: campaigns, error } = await query;
    if (error) throw error;
    res.json(campaigns);
  } catch (err) { next(err); }
};

// PUT /api/admin/campaigns/:id/moderate — approve / suspend / reject / remove
const moderateCampaign = async (req, res, next) => {
  try {
    const sb = getSupabase();
    const { action, rejection_reason } = req.body;
    const statusMap = { approve: 'active', suspend: 'suspended', reject: 'rejected', remove: 'closed' };
    if (!statusMap[action]) return res.status(400).json({ message: 'Invalid action.' });

    const update = { status: statusMap[action] };
    if (action === 'reject' && rejection_reason) update.rejection_reason = rejection_reason;

    const { data: campaign, error } = await sb
      .from('campaigns').update(update).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ message: `Campaign ${action}d successfully.`, campaign });
  } catch (err) { next(err); }
};

// GET /api/admin/stats — platform overview
const getStats = async (req, res, next) => {
  try {
    const sb = getSupabase();
    const [
      { count: totalCampaigns },
      { count: pendingCampaigns },
      { count: totalDonations },
      { data: raisedData },
    ] = await Promise.all([
      sb.from('campaigns').select('*', { count: 'exact', head: true }),
      sb.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      sb.from('donations').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      sb.from('donations').select('amount').eq('status', 'completed'),
    ]);
    const totalRaised = (raisedData || []).reduce((sum, d) => sum + (d.amount || 0), 0);
    res.json({ totalCampaigns, pendingCampaigns, totalDonations, totalRaised });
  } catch (err) { next(err); }
};

module.exports = { getAllCampaigns, moderateCampaign, getStats };
