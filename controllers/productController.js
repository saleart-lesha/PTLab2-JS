const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb'); // Добавлено

router.get('/', async (req, res) => {
    const db = req.dbClient.db('PT_Lab2');
    const productsCollection = db.collection('products');

    try {
        const products = await productsCollection.find().toArray();

        const productsWithDiscount = products.map(product => ({
            ...product,
            discountedPrice: product.discountedPrice || product.price,
        }));

        res.render('index.ejs', { products: productsWithDiscount, cart: req.cart });
    } catch (error) {
        console.error('Ошибка при получении продуктов из базы данных', error);
        res.status(500).send('Internal Server Error: ' + error.message);
    }
});

router.post('/add_to_cart', async (req, res) => {
    const productId = req.body.product_id;
    const quantity = parseInt(req.body.quantity);

    try {
        // Получаем доступ к базе данных через клиент
        const db = req.dbClient.db('PT_Lab2');
        const productsCollection = db.collection('products');
        const cartsCollection = db.collection('carts');

        // Находим товар в коллекции продуктов
        const product = await productsCollection.findOne({ _id: new ObjectId(productId) });

        if (product) {
            // Если товар уже в корзине, увеличиваем количество
            const existingCartItem = await cartsCollection.findOne({ productId: new ObjectId(productId) });

            if (existingCartItem) {
                await cartsCollection.updateOne(
                    { productId: new ObjectId(productId) },
                    { $inc: { quantity: quantity } }
                );
            } else {
                // Если товара нет в корзине, добавляем новый
                await cartsCollection.insertOne({
                    productId: new ObjectId(productId),
                    quantity: quantity,
                });
            }

            // Обновляем данные корзины в памяти
            req.cart.addItem(product, quantity);

            // После успешного добавления товара в корзину, перенаправляем на главную страницу
            res.redirect('/');
        } else {
            throw new Error('Товар не найден в базе данных');
        }
    } catch (error) {
        console.error('Ошибка при добавлении товара в корзину', error);
        res.status(500).send('Internal Server Error: ' + error.message);
    }
});


module.exports = router;
