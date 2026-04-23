const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  donationId: { type: DataTypes.INTEGER, allowNull: false },
  gateway: { type: DataTypes.ENUM('stripe', 'paypal'), defaultValue: 'stripe' },
  transactionId: { type: DataTypes.STRING },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'success', 'failed'), defaultValue: 'pending' },
  processedAt: { type: DataTypes.DATE },
}, { tableName: 'payments' });

module.exports = Payment;
