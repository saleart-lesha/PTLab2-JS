const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
    code: String,
    percentage: Number
});

const Discount = mongoose.model('discounts', discountSchema);

module.exports = Discount;
