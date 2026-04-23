const express = require('express');
const { getDonationHistory, getCampaignDonations } = require('../controllers/donationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/history', protect, getDonationHistory);
router.get('/campaign/:id', protect, getCampaignDonations);

module.exports = router;
