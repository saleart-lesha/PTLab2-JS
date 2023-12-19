const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();

// Функция для получения товара по его идентификатору из коллекции продуктов
async function getProductById(productsCollection, productId) {
    return await productsCollection.findOne({ _id: new ObjectId(productId) });
}

// Обработчик для отображения содержимого корзины
router.get('/', async (req, res) => {
    // Получение базы данных, коллекций корзин и продуктов
    const db = req.dbClient.db('PT_Lab2');
    const cartsCollection = db.collection('carts');
    const productsCollection = db.collection('products');

    try {
        // Получение всех элементов корзины из базы данных
        const cartItems = await cartsCollection.find().toArray();

        // Функция для получения деталей товаров в корзине
        const getCartItemDetails = async (item) => {
            const product = await getProductById(productsCollection, item.productId);
            const totalCost = (product.discountedPrice || product.price) * item.quantity;

            return {
                name: product.name,
                quantity: item.quantity,
                totalCost: totalCost,
            };
        };

        // Получение деталей каждого товара в корзине асинхронно
        const cartDetails = await Promise.all(cartItems.map(getCartItemDetails));

        // Подсчет общей стоимости корзины
        const cartTotal = cartDetails.reduce((total, item) => total + item.totalCost, 0);

        // Рендеринг шаблона и передача данных в ответ
        res.render('cart.ejs', {
            cartDetails,
            cartTotal,
            cartDiscount: req.cart.appliedPromoCodes.length > 0 ? req.cart.calculateTotal() : 0,
            errorMessage: req.query.errorMessage
        });
    } catch (error) {
        // Обработка ошибок при получении данных из базы
        res.status(500).send('Internal Server Error: ' + error.message);
    }
});

// Обработчик для применения промокода к товарам в корзине
router.post('/apply_promo', async (req, res) => {
    // Получение промокодa и текущей корзины из запроса
    const promoCode = req.body.promo_code;
    const cart = req.cart;

    // Получение коллекции промокодов из базы данных
    const promoCodesCollection = req.dbClient.db('PT_Lab2').collection('discount');

    try {
        // Проверка, не был ли промокод уже применен к корзине
        if (cart.appliedPromoCodes.length > 0) {
            res.json({ success: false, errorMessage: 'Промокод уже был применен' });
            return;
        }

        // Поиск промокода в коллекции
        const promo = await promoCodesCollection.findOne({ code: promoCode });

        if (promo) {
            // Применение скидки к товарам в корзине
            cart.items.forEach(item => {
                const discountedPrice = item.product.price * (1 - promo.percentage / 100);
                item.product.discountedPrice = discountedPrice;
                item.totalCost = discountedPrice * item.quantity;
            });

            // Добавление промокода в список использованных
            cart.appliedPromoCodes.push(promoCode);

            // Обновление корзины в запросе для отражения изменений
            req.cart = cart;

            // Пересчет общей стоимости корзины с учетом скидки
            const cartTotalWithDiscount = cart.calculateTotal();

            // Отправка успешного ответа с обновленными данными о корзине
            res.json({ success: true, cartTotal: cartTotalWithDiscount, cartDetails: cart.items });
        } else {
            // Отправка ответа с сообщением о том, что промокод не найден
            res.json({ success: false, errorMessage: 'Промокод не найден' });
        }
    } catch (error) {
        // Обработка ошибок при обработке промокода
        res.json({ success: false, errorMessage: 'Internal Server Error: ' + error.message });
    }
});

// Обработчик для оформления заказа и очистки корзины
router.post('/checkout', async (req, res) => {
    const db = req.dbClient.db('PT_Lab2');
    const cartsCollection = db.collection('carts');

    try {
        // Очистка корзины и промокодов
        req.cart.clear();

        // Удаление записи о корзине из БД
        await cartsCollection.deleteMany({});

        // Перенаправление на главную страницу после успешного оформления заказа
        res.redirect('/');
    } catch (error) {
        // Обработка ошибок при оформлении заказа
        res.status(500).send('Internal Server Error: ' + error.message);
    }
});

module.exports = router;
