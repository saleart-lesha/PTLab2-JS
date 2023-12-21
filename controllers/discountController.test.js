const { applyDiscount, resetPromoCode } = require('./discountController');
const Discount = require('../models/discount');
const Product = require('../models/product');

// Замена модулей для тестирования
jest.mock('../models/discount');
jest.mock('../models/product');

describe('applyDiscount', () => {
    let req, res;

    beforeEach(() => {
        req = { body: { code: 'validCode' } };
        res = { json: jest.fn(), status: jest.fn() };
        res.status.mockReturnValue(res);
        res.send = jest.fn();
        isPromoCodeEntered = false;
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    test('Успешное применение скидки', async () => {
        Discount.findOne.mockResolvedValue({ percentage: 10 });
        Product.updateMany.mockResolvedValue({});
        Product.find.mockResolvedValue([]);

        await applyDiscount(req, res);

        // Проверка вызова функций и ожидаемый результат
        expect(Discount.findOne).toHaveBeenCalledWith({ code: 'validCode' });
        expect(Product.updateMany).toHaveBeenCalledWith(
            { discountedPrice: { $ne: null } },
            { $mul: { discountedPrice: 0.9 } }
        );
        expect(Product.find).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            percentage: 10,
            updatedProducts: []
        });
    });

    test('Обработка случая, когда промокод уже введен', async () => {
        isPromoCodeEntered = true; // Промокод уже введен

        await applyDiscount(req, res);

        // Проверка, что функция findOne не вызывается и возвращается ошибка
        expect(Discount.findOne).not.toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Промокод уже введен'
        });
    });
});

describe('resetPromoCode', () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = { json: jest.fn(), status: jest.fn() };
        res.status.mockReturnValue(res);
        res.send = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    test('Сбрасывание промокода', async () => {
        Product.aggregate.mockResolvedValue([]);
        Product.find.mockResolvedValue([]);

        await resetPromoCode(req, res);

        // Проверяется вызов функций и ожидаемый результат
        expect(Product.aggregate).toHaveBeenCalledWith([
            { $match: { discountedPrice: { $exists: true } } },
            { $addFields: { discountedPrice: '$price' } },
            { $merge: { into: 'products', whenMatched: 'merge' } }
        ]);
        expect(Product.find).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Промокод сброшен',
            updatedProducts: []
        });
    });

    test('Обработка ошибки при сбросе промокода', async () => {
        Product.aggregate.mockRejectedValue(new Error('Database error'));

        await resetPromoCode(req, res);

        // Проверка, что возвращается ошибка и устанавливается соответствующий статус
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith('Database error');
    });
});
