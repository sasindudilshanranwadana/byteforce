const sequelize = require('../config/database');
const User = require('./User');
const Campaign = require('./Campaign');
const Donation = require('./Donation');
const Payment = require('./Payment');
const RewardTier = require('./RewardTier');

// Associations
User.hasMany(Campaign, { foreignKey: 'userId', as: 'campaigns' });
Campaign.belongsTo(User, { foreignKey: 'userId', as: 'creator' });

User.hasMany(Donation, { foreignKey: 'backerId', as: 'donations' });
Donation.belongsTo(User, { foreignKey: 'backerId', as: 'backer' });

Campaign.hasMany(Donation, { foreignKey: 'campaignId', as: 'donations' });
Donation.belongsTo(Campaign, { foreignKey: 'campaignId', as: 'campaign' });

Campaign.hasMany(RewardTier, { foreignKey: 'campaignId', as: 'rewardTiers' });
RewardTier.belongsTo(Campaign, { foreignKey: 'campaignId' });

Donation.hasOne(Payment, { foreignKey: 'donationId', as: 'payment' });
Payment.belongsTo(Donation, { foreignKey: 'donationId' });

module.exports = { sequelize, User, Campaign, Donation, Payment, RewardTier };
