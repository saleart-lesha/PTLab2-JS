const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const cart = req.cart;
    const itemsWithDiscount = cart.items.map(item => ({
        ...item,
        product: {
            ...item.product,
            discountedPrice: item.product.discountedPrice || item.product.price,
        },
    }));

    res.render('cart.ejs', { cart: { items: itemsWithDiscount, calculateTotal: cart.calculateTotal.bind(cart) } });
});

router.post('/apply_promo', (req, res) => {
    const promoCode = req.body.promo_code;
    const cart = req.cart;

    const promoCodes = {
        'CODE5': 5,
        'CODE10': 10,
        'CODE15': 15
    };

    if (promoCodes.hasOwnProperty(promoCode)) {
        const discountPercentage = promoCodes[promoCode];

        cart.items.forEach(item => {
            const discountedPrice = item.product.price * (1 - discountPercentage / 100);
            item.product.discountedPrice = discountedPrice;
        });

        res.redirect('/cart');
    } else {
        res.redirect('/cart');
    }
});

module.exports = router;
