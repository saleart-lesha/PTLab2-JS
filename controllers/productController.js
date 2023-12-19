// Подключение библиотеки express и создание роутера
const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

// Обработчик для отображения главной страницы
router.get('/', async (req, res) => {
    // Получение доступа к базе данных и коллекции продуктов
    const db = req.dbClient.db('PT_Lab2');
    const productsCollection = db.collection('products');

    try {
        // Получение списка всех продуктов из базы данных
        const products = await productsCollection.find().toArray();

        // Добавление информации о скидке для отображения на главной странице
        const productsWithDiscount = products.map(product => ({
            ...product,
            discountedPrice: product.discountedPrice || product.price,
        }));

        // Рендеринг шаблона главной страницы с передачей списка продуктов и корзины
        res.render('index.ejs', { products: productsWithDiscount, cart: req.cart });
    } catch (error) {
        // Обработка ошибок при получении продуктов из базы данных
        console.error('Ошибка при получении продуктов из базы данных', error);
        res.status(500).send('Internal Server Error: ' + error.message);
    }
});

// Обработчик для добавления товара в корзину
router.post('/add_to_cart', async (req, res) => {
    // Извлечение идентификатора продукта и количества из запроса
    const productId = req.body.product_id;
    const quantity = parseInt(req.body.quantity);

    try {
        // Получение доступа к базе данных и коллекциям продуктов и корзин
        const db = req.dbClient.db('PT_Lab2');
        const productsCollection = db.collection('products');
        const cartsCollection = db.collection('carts');

        // Поиск товара по идентификатору
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

            // Обновление данных о корзине в памяти приложения
            req.cart.addItem(product, quantity);
        }

    } catch (error) {
        // Обработка ошибок при добавлении товара в корзину
        console.error('Ошибка при добавлении товара в корзину', error);
        res.status(500).send('Internal Server Error: ' + error.message);
    }
});

module.exports = router;
