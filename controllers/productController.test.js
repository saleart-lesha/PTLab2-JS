const request = require('supertest');
const Product = require('../models/product');
const { getAllProducts } = require('./productController');

// Замена модуля для тестирования
jest.mock('../models/product');

describe('getAllProducts', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    test('Успешное получение всех продуктов', async () => {
        const mockProducts = [
            { _id: '1', name: 'Product 1', price: 10 },
            { _id: '2', name: 'Product 2', price: 20 }
        ];

        Product.find.mockResolvedValue(mockProducts);

        const req = {};
        const res = { json: jest.fn() };

        await getAllProducts(req, res);

        // Проверка вызова функций и ожидаемый результат
        expect(Product.find).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(mockProducts);
    });

    test('Обработка ошибки при получении всех продуктов', async () => {
        const errorMessage = 'Database error';
        Product.find.mockRejectedValue(new Error(errorMessage));

        const req = {};
        const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

        await getAllProducts(req, res);

        // Проверка вызова функций и ожидаемый результат
        expect(Product.find).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith(errorMessage);
    });
});
