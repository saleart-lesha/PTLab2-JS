// cart.js
class Cart {
    constructor() {
        this.items = [];
        this.appliedPromoCodes = [];
    }

    addItem(product, quantity) {
        this.items.push({ product, quantity });
    }

    calculateTotal() {
        return this.items.reduce((total, item) => total + (item.product.discountedPrice || item.product.price) * item.quantity, 0);
    }

    clear() {
        this.items = [];
        this.appliedPromoCodes = []; // Сбрасываем примененные промокоды при очистке корзины
    }
}

module.exports = Cart;
