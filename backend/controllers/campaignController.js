const getSupabase = require('../config/supabase');

// GET /api/campaigns — browse & search (SCRUM-19)
const getCampaigns = async (req, res, next) => {
  try {
    const sb = getSupabase();
    const { search, category, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    let query = sb
      .from('campaigns')
      .select('*, profiles(id, name)', { count: 'exact' })
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    if (category) query = query.eq('category', category);

    const { data: campaigns, error, count } = await query;
    if (error) throw error;
    res.json({ campaigns, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) });
  } catch (err) { next(err); }
};

// GET /api/campaigns/my — campaigner's own campaigns
const getMyCampaigns = async (req, res, next) => {
  try {
    const sb = getSupabase();
    const { data: campaigns, error } = await sb
      .from('campaigns')
      .select('*, reward_tiers(*)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(campaigns);
  } catch (err) { next(err); }
};

// GET /api/campaigns/:id
const getCampaignById = async (req, res, next) => {
  try {
    const sb = getSupabase();
    const { data: campaign, error } = await sb
      .from('campaigns')
      .select('*, profiles(id, name), reward_tiers(*)')
      .eq('id', req.params.id)
      .single();
    if (error || !campaign) return res.status(404).json({ message: 'Campaign not found.' });
    res.json(campaign);
  } catch (err) { next(err); }
};

// POST /api/campaigns — create campaign (SCRUM-18)
const createCampaign = async (req, res, next) => {
  try {
    const sb = getSupabase();
    const { title, description, goal_amount, deadline, category, image_url, reward_tiers } = req.body;
    const { data: campaign, error } = await sb
      .from('campaigns')
      .insert({ user_id: req.user.id, title, description, goal_amount, deadline, category: category || 'General', image_url, status: 'pending' })
      .select()
      .single();
    if (error) throw error;

    if (reward_tiers && reward_tiers.length > 0) {
      await sb.from('reward_tiers').insert(reward_tiers.map(t => ({ ...t, campaign_id: campaign.id })));
    }
    res.status(201).json(campaign);
  } catch (err) { next(err); }
};

// PUT /api/campaigns/:id — edit campaign
const updateCampaign = async (req, res, next) => {
  try {
    const sb = getSupabase();
    const { data: existing, error: fetchErr } = await sb
      .from('campaigns').select('user_id').eq('id', req.params.id).single();
    if (fetchErr || !existing) return res.status(404).json({ message: 'Campaign not found.' });
    if (existing.user_id !== req.user.id) return res.status(403).json({ message: 'Not authorised.' });

    const { data: campaign, error } = await sb
      .from('campaigns').update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(campaign);
  } catch (err) { next(err); }
};

module.exports = { getCampaigns, getCampaignById, createCampaign, updateCampaign, getMyCampaigns };
