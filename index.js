const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const Cart = require('./models/cart');
const productController = require('./controllers/productController');
const cartController = require('./controllers/cartController');

// Создание корзины в памяти
const inMemoryCart = new Cart();

// Подключение к базе данных
const uri = 'mongodb://127.0.0.1:27017/PT_Lab2';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect()
    .then(() => {
        console.log('Успешное подключение к базе данных');
    })
    .catch(err => {
        console.error('Ошибка подключения к базе данных', err);
    });

// Middleware для передачи корзины в запрос
app.use((req, res, next) => {
    req.cart = inMemoryCart;
    req.dbClient = client;
    next();
});

// Middleware для парсинга данных формы
app.use(express.urlencoded({ extended: true }));

// Роуты
app.use('/', productController);
app.use('/cart', cartController);

// Запуск сервера
const port = 3001;
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});