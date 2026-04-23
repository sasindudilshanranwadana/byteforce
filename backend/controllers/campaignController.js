const { Op } = require('sequelize');
const { Campaign, User, RewardTier, Donation } = require('../models');

// GET /api/campaigns — browse & search (SCRUM-19)
const getCampaigns = async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 12 } = req.query;
    const where = { status: 'active' };
    if (search) where[Op.or] = [{ title: { [Op.like]: `%${search}%` } }, { description: { [Op.like]: `%${search}%` } }];
    if (category) where.category = category;

    const offset = (page - 1) * limit;
    const { rows: campaigns, count } = await Campaign.findAndCountAll({
      where, limit: parseInt(limit), offset,
      include: [{ model: User, as: 'creator', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ campaigns, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) });
  } catch (err) { next(err); }
};

// GET /api/campaigns/:id
const getCampaignById = async (req, res, next) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: RewardTier, as: 'rewardTiers', order: [['minimumAmount', 'ASC']] },
      ],
    });
    if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });
    res.json({ ...campaign.toJSON(), progress: campaign.getProgress() });
  } catch (err) { next(err); }
};

// POST /api/campaigns — create campaign (SCRUM-18)
const createCampaign = async (req, res, next) => {
  try {
    const { title, description, goalAmount, deadline, category, imageUrl, rewardTiers } = req.body;
    const campaign = await Campaign.create({
      userId: req.user.id, title, description, goalAmount, deadline,
      category: category || 'General', imageUrl, status: 'pending',
    });
    if (rewardTiers && rewardTiers.length > 0) {
      await RewardTier.bulkCreate(rewardTiers.map(t => ({ ...t, campaignId: campaign.id })));
    }
    res.status(201).json(campaign);
  } catch (err) { next(err); }
};

// PUT /api/campaigns/:id — edit campaign
const updateCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });
    if (campaign.userId !== req.user.id) return res.status(403).json({ message: 'Not authorised.' });
    await campaign.update(req.body);
    res.json(campaign);
  } catch (err) { next(err); }
};

// GET /api/campaigns/my — campaigner's own campaigns
const getMyCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.findAll({
      where: { userId: req.user.id },
      include: [{ model: RewardTier, as: 'rewardTiers' }],
      order: [['createdAt', 'DESC']],
    });
    res.json(campaigns.map(c => ({ ...c.toJSON(), progress: c.getProgress() })));
  } catch (err) { next(err); }
};

module.exports = { getCampaigns, getCampaignById, createCampaign, updateCampaign, getMyCampaigns };
