const Cart = require('./cart');

describe('Cart Model', () => {
    test('Добавление товара в корзину', () => {
        const cart = new Cart();
        const product = { name: 'Product 1', price: 20 };
        const quantity = 2;

        cart.addItem(product, quantity);

        expect(cart.items.length).toBe(1);
        expect(cart.items[0].product).toBe(product);
        expect(cart.items[0].quantity).toBe(quantity);
        expect(cart.items[0].totalCost).toBe(product.price * quantity);
    });


    test('Вычисление общей стоимости корзины', () => {
        const cart = new Cart();
        const product1 = { name: 'Product 1', price: 20 };
        const product2 = { name: 'Product 2', price: 30 };
        const quantity1 = 2;
        const quantity2 = 3;

        cart.addItem(product1, quantity1);
        cart.addItem(product2, quantity2);

        const expectedTotal = product1.price * quantity1 + product2.price * quantity2;

        expect(cart.calculateTotal()).toBe(expectedTotal);
    });


    test('Очистка корзины', () => {
        const cart = new Cart();
        const product = { name: 'Product 1', price: 20 };
        const quantity = 2;

        cart.addItem(product, quantity);
        cart.clear();

        expect(cart.items.length).toBe(0);
        expect(cart.appliedPromoCodes.length).toBe(0);
    });


    test('Обработка некорректного количества товара', () => {
        const cart = new Cart();
        const product = { name: 'Product 1', price: 20 };
        const invalidQuantity = 'abc';

        cart.addItem(product, invalidQuantity);

        expect(cart.items.length).toBe(1);
        expect(cart.items[0].quantity).toBe(1);
    });


    test('Очистка корзины с примененным промокодом', () => {
        const cart = new Cart();
        const product = { name: 'Product 1', price: 20 };
        const quantity = 2;
        const promoCode = 'DISCOUNT10';

        cart.addItem(product, quantity);
        cart.appliedPromoCodes.push(promoCode);
        cart.clear();

        expect(cart.items.length).toBe(0);
        expect(cart.appliedPromoCodes.length).toBe(0);
    });

});
