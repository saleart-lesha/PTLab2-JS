const Discount = require('../models/discount');
const Product = require('../models/product');

let isPromoCodeEntered = false; // Переменная для отслеживания статуса введенного промокода

async function applyDiscount(req, res) {
    const { code } = req.body;
    try {
        if (isPromoCodeEntered) {
            // Если промокод уже был введен, происходит отправка сообщения об ошибке
            res.json({ success: false, message: 'Промокод уже введен' });
            return;
        }

        const discount = await Discount.findOne({ code });

        if (discount) {
            // Применение скидки к продуктам в базе данных
            await Product.updateMany(
                { discountedPrice: { $ne: null } },
                { $mul: { discountedPrice: 1 - discount.percentage / 100 } }
            );

            // Получение обновленных данных о продуктах после применения скидки
            const updatedProducts = await Product.find();

            // Устанавливание флага, что промокод был введен
            isPromoCodeEntered = true;

            res.json({ success: true, percentage: discount.percentage, updatedProducts });
        } else {
            res.json({ success: false, message: 'Промокод не найден' });
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
}

async function resetPromoCode(req, res) {
    isPromoCodeEntered = false;

    try {
        // Сброс discountedPrice к price для всех продуктов
        let updatedProducts = await Product.aggregate([
            {
                $match: { discountedPrice: { $exists: true } }
            },
            {
                $addFields: { discountedPrice: "$price" }
            },
            {
                $merge: { into: "products", whenMatched: "merge" }
            }
        ]);

        updatedProducts = await Product.find();

        res.json({ success: true, message: 'Промокод сброшен', updatedProducts });
    } catch (error) {
        res.status(500).send(error.message);
    }
}

module.exports = {
    applyDiscount,
    resetPromoCode
};
