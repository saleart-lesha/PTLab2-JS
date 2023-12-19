class Cart {
    constructor() {
        this.items = [];
        this.appliedPromoCodes = [];
    }

    addItem(product, quantity) {
        const item = {
            product,
            quantity: parseInt(quantity) || 1, // обработка некорректного количества
            totalCost: (product.price || 0) * (parseInt(quantity) || 1), // инициализация totalCost при добавлении товара
        };
        this.items.push(item);
    }

    calculateTotal() {
        return this.items.reduce((total, item) => {
            const price = item.product.discountedPrice || item.product.price || 0;
            return total + price * item.quantity;
        }, 0);
    }

    clear() {
        this.items = [];
        this.appliedPromoCodes = []; // Сбрасывание промокода при очистке корзины
    }
}

module.exports = Cart;
