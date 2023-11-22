const express = require('express');
const app = express();
const Cart = require('./models/cart');
const productController = require('./controllers/productController');
const cartController = require('./controllers/cartController');

const inMemoryCart = new Cart(); // Создаем корзину в памяти

// Middleware для передачи корзины в запрос
app.use((req, res, next) => {
    req.cart = inMemoryCart;
    next();
});

// Middleware для парсинга данных формы
app.use(express.urlencoded({ extended: true }));

// Роуты
app.use('/', productController);
app.use('/cart', cartController);

// Запуск сервера
const port = 3000;
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
