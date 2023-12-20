const express = require('express');
const discountController = require('../controllers/discountController');

const router = express.Router();

router.post('/apply-discount', discountController.applyDiscount);
router.post('/reset-promo-code', discountController.resetPromoCode);

module.exports = router;
