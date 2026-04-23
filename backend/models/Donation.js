const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Donation = sequelize.define('Donation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  backerId: { type: DataTypes.INTEGER, allowNull: false },
  campaignId: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'completed', 'failed'), defaultValue: 'pending' },
  rewardTierId: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'donations' });

module.exports = Donation;
