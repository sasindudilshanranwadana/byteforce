const { Campaign, User, Donation } = require('../models');

// GET /api/admin/campaigns — all campaigns with filter (SCRUM-26)
const getAllCampaigns = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    const campaigns = await Campaign.findAll({
      where,
      include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(campaigns.map(c => ({ ...c.toJSON(), progress: c.getProgress() })));
  } catch (err) { next(err); }
};

// PUT /api/admin/campaigns/:id/moderate — approve / suspend / reject / remove
const moderateCampaign = async (req, res, next) => {
  try {
    const { action } = req.body; // 'approve' | 'suspend' | 'reject' | 'remove'
    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });

    const statusMap = { approve: 'active', suspend: 'suspended', reject: 'rejected', remove: 'closed' };
    if (!statusMap[action]) return res.status(400).json({ message: 'Invalid action.' });

    await campaign.update({ status: statusMap[action] });
    res.json({ message: `Campaign ${action}d successfully.`, campaign });
  } catch (err) { next(err); }
};

// GET /api/admin/stats — platform overview
const getStats = async (req, res, next) => {
  try {
    const { sequelize } = require('../models');
    const [totalCampaigns, pendingCampaigns, totalDonations, totalRaised] = await Promise.all([
      Campaign.count(),
      Campaign.count({ where: { status: 'pending' } }),
      Donation.count({ where: { status: 'completed' } }),
      Donation.sum('amount', { where: { status: 'completed' } }),
    ]);
    res.json({ totalCampaigns, pendingCampaigns, totalDonations, totalRaised: totalRaised || 0 });
  } catch (err) { next(err); }
};

module.exports = { getAllCampaigns, moderateCampaign, getStats };
