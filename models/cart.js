class Cart {
    constructor() {
        this.items = [];
    }

    addItem(product, quantity) {
        this.items.push({ product, quantity });
    }

    calculateTotal() {
        return this.items.reduce((total, item) => total + (item.product.discountedPrice || item.product.price) * item.quantity, 0);
    }
}

module.exports = Cart;
