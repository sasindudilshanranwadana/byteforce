const express = require('express');
const { getCampaigns, getCampaignById, createCampaign, updateCampaign, getMyCampaigns } = require('../controllers/campaignController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getCampaigns);                        // public
router.get('/my', protect, getMyCampaigns);           // campaigner only
router.get('/:id', getCampaignById);                  // public
router.post('/', protect, createCampaign);            // campaigner
router.put('/:id', protect, updateCampaign);          // campaigner (own)

module.exports = router;
