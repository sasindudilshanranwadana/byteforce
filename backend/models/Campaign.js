const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Campaign = sequelize.define('Campaign', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  goalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  raisedAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  deadline: { type: DataTypes.DATEONLY, allowNull: false },
  category: { type: DataTypes.STRING, defaultValue: 'General' },
  imageUrl: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('pending', 'active', 'suspended', 'closed', 'rejected'), defaultValue: 'pending' },
}, { tableName: 'campaigns' });

Campaign.prototype.getProgress = function () {
  return Math.min(100, ((this.raisedAmount / this.goalAmount) * 100).toFixed(1));
};

module.exports = Campaign;
