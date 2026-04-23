const { Donation, Campaign, User } = require('../models');

// GET /api/donations/history — backer's donation history (SCRUM-27)
const getDonationHistory = async (req, res, next) => {
  try {
    const donations = await Donation.findAll({
      where: { backerId: req.user.id },
      include: [{ model: Campaign, as: 'campaign', attributes: ['id', 'title', 'imageUrl', 'status'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(donations);
  } catch (err) { next(err); }
};

// GET /api/donations/campaign/:id — donations for a campaign (campaigner analytics)
const getCampaignDonations = async (req, res, next) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });
    if (campaign.userId !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorised.' });

    const donations = await Donation.findAll({
      where: { campaignId: req.params.id, status: 'completed' },
      include: [{ model: User, as: 'backer', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(donations);
  } catch (err) { next(err); }
};

module.exports = { getDonationHistory, getCampaignDonations };
