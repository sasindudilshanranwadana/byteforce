const getSupabase = require('../config/supabase');

// GET /api/donations/history — backer's donation history (SCRUM-27)
const getDonationHistory = async (req, res, next) => {
  try {
    const sb = getSupabase();
    const { data: donations, error } = await sb
      .from('donations')
      .select('*, campaigns(id, title, image_url, status)')
      .eq('backer_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(donations);
  } catch (err) { next(err); }
};

// GET /api/donations/campaign/:id — donations for a campaign (campaigner analytics)
const getCampaignDonations = async (req, res, next) => {
  try {
    const sb = getSupabase();
    const { data: campaign, error: campErr } = await sb
      .from('campaigns').select('user_id').eq('id', req.params.id).single();
    if (campErr || !campaign) return res.status(404).json({ message: 'Campaign not found.' });
    if (campaign.user_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorised.' });

    const { data: donations, error } = await sb
      .from('donations')
      .select('*, profiles(id, name)')
      .eq('campaign_id', req.params.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(donations);
  } catch (err) { next(err); }
};

module.exports = { getDonationHistory, getCampaignDonations };
