const express = require('express');
const { checkout, webhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/checkout', protect, checkout);
router.post('/webhook', express.raw({ type: 'application/json' }), webhook);

module.exports = router;
