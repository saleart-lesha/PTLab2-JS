const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Product = require('./models/product');
const productRoutes = require('./routes/productRoutes');
const discountRoutes = require('./routes/discountRoutes');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.set('view engine', 'ejs');

mongoose.connect('mongodb://127.0.0.1:27017/PT_Lab2', { useNewUrlParser: true, useUnifiedTopology: true });

app.use('/api', productRoutes);
app.use('/api', discountRoutes);
app.use(express.static('public'));

// Добавление маршрута для отображения страницы
app.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.render('index', { products });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
