class Cart {
    constructor() {
        this.items = [];
        this.appliedPromoCodes = [];
    }

    addItem(product, quantity) {
        this.items.push({ product, quantity });
    }

    applyDiscount(promo) {
        const discountPercentage = promo.percentage;

        // Применяем скидку к стоимости товаров в корзине
        this.items.forEach(item => {
            // Сохраняем оригинальную цену товара
            const originalPrice = item.product.price;

            // Рассчитываем новую цену со скидкой
            item.product.discountedPrice = originalPrice * (1 - discountPercentage / 100);

            // Обновляем общую стоимость с учетом скидки
            item.totalCost = item.product.discountedPrice * item.quantity;
        });
        // Обновляем примененные промокоды в корзине
        this.appliedPromoCodes.push(promo.code);
    }

    calculateTotal() {
        return this.items.reduce((total, item) => total + item.totalCost, 0);
    }

    clear() {
        this.items = [];
        this.appliedPromoCodes = []; // Сбрасываем примененные промокоды при очистке корзины
    }
}

module.exports = Cart;
