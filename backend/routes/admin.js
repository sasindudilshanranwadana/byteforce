const express = require('express');
const { getAllCampaigns, moderateCampaign, getStats } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, adminOnly);
router.get('/campaigns', getAllCampaigns);
router.put('/campaigns/:id/moderate', moderateCampaign);
router.get('/stats', getStats);

module.exports = router;
