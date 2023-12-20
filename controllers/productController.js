const Product = require('../models/product');

async function getAllProducts(req, res) {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

module.exports = {
    getAllProducts
};
