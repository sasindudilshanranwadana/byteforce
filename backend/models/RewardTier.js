const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RewardTier = sequelize.define('RewardTier', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  campaignId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  minimumAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  description: { type: DataTypes.TEXT },
}, { tableName: 'reward_tiers' });

module.exports = RewardTier;
