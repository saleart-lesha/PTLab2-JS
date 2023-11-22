class Product {
    constructor(name, price) {
        this.name = name;
        this.price = price;
        this.discountedPrice = price; // Добавляем свойство для хранения с учетом скидки
    }
}

module.exports = Product;