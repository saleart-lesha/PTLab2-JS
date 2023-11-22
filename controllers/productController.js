const express = require('express');
const router = express.Router();
const Product = require('../models/product');

const products = [
    new Product("Товар 1", 100),
    new Product("Товар 2", 150),
    new Product("Товар 3", 200),
];

router.get('/', (req, res) => {
    const productsWithDiscount = products.map(product => ({
        ...product,
        discountedPrice: product.discountedPrice || product.price,
    }));
    res.render('index.ejs', { products: productsWithDiscount, cart: req.cart });
});

router.post('/add_to_cart', (req, res) => {
    const productId = parseInt(req.body.product_id);
    const quantity = parseInt(req.body.quantity);
    const product = products.find((product, index) => index + 1 === productId);

    if (product) {
        req.cart.addItem(product, quantity);
    }
    res.redirect('/');
});

module.exports = router;
