const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

router.get('/', async (req, res) => {
    const db = req.dbClient.db('PT_Lab2');
    const cartsCollection = db.collection('carts');
    const productsCollection = db.collection('products');

    try {
        const cartItems = await cartsCollection.find().toArray();
        const cartDetails = [];

        for (const item of cartItems) {
            const product = await productsCollection.findOne({ _id: new ObjectId(item.productId) });

            const totalCost = (product.discountedPrice) * item.quantity;

            cartDetails.push({
                name: product.name,
                quantity: item.quantity,
                totalCost: totalCost,
            });
        }

        const cartTotal = cartDetails.reduce((total, item) => total + item.totalCost, 0);

        res.render('cart.ejs', { cartDetails: cartDetails, cartTotal: cartTotal, cartDiscount: req.cart.appliedPromoCodes.length > 0 ? req.cart.calculateTotal() : 0, errorMessage: req.query.errorMessage });
    } catch (error) {
        console.error('Ошибка при получении корзины из базы данных', error);
        res.status(500).send('Internal Server Error: ' + error.message);
    }
});

router.post('/apply_promo', async (req, res) => {
    const promoCode = req.body.promo_code;
    const cart = req.cart;

    const promoCodesCollection = req.dbClient.db('PT_Lab2').collection('discount');

    try {
        // Проверка применения промокода
        if (cart.appliedPromoCodes.length > 0) {
            res.json({ success: false, errorMessage: 'Промокод уже был применен' });
            return;
        }

        const promo = await promoCodesCollection.findOne({ code: promoCode });

        if (promo) {
            const discountPercentage = promo.percentage;

            // Применение скидки
            cart.items.forEach(item => {
                const discountedPrice = item.product.price * (1 - discountPercentage / 100);
                item.product.discountedPrice = discountedPrice;
                item.totalCost = discountedPrice * item.quantity;
            });

            // Добавляем промокод, как использованный
            cart.appliedPromoCodes.push(promoCode);

            // Обновляем корзину в req, чтобы отразить изменения
            req.cart = cart;

            // Пересчитываем общую стоимость с учетом скидки
            const cartTotalWithDiscount = cart.calculateTotal();

            res.json({ success: true, cartTotal: cartTotalWithDiscount, cartDetails: cart.items });
        } else {
            res.json({ success: false, errorMessage: 'Промокод не найден' });
        }
    } catch (error) {
        console.error('Ошибка при обработке промокода', error);
        res.json({ success: false, errorMessage: 'Internal Server Error: ' + error.message });
    }
});

router.post('/checkout', async (req, res) => {
    const db = req.dbClient.db('PT_Lab2');
    const cartsCollection = db.collection('carts');

    try {
        // Очистка корзины и промокодов
        req.cart.clear();

        // Удаление записи о корзине из БД
        await cartsCollection.deleteMany({});

        res.redirect('/');

    } catch (error) {
        console.error('Ошибка при оформлении заказа', error);
        res.status(500).send('Internal Server Error: ' + error.message);
    }
});

module.exports = router;
