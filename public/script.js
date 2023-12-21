// Функция для применения скидки при вводе промокода
async function applyDiscountClient() {
    // Получение значения промокода из элемента с id 'promoCode'
    const promoCode = document.getElementById('promoCode').value;

    // Отправление запроса на сервер для применения скидки
    const response = await fetch('/api/apply-discount', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: promoCode }),
    });

    // Получение результата запроса от сервера
    const result = await response.json();

    // Получение элементов DOM для отображения результата
    const discountResult = document.getElementById('discountResult');
    const productsContainer = document.getElementById('productsContainer');

    // Если скидка успешно применена
    if (result.success) {
        // Отображение информации о скидке
        discountResult.style.color = 'green';
        discountResult.textContent = `Скидка составила: ${result.percentage}%`;

        // Очищение контейнера продуктов
        productsContainer.innerHTML = '';

        // Добавление обновленных продуктов на страницу
        result.updatedProducts.forEach(product => {
            const productElement = document.createElement('li');
            productElement.textContent = `${product.name} - ${product.price} руб.`;

            // Если есть скидка, происходит добавление информации о скидке
            if (product.discountedPrice !== product.price) {
                const discountedElement = document.createElement('span');
                discountedElement.style.color = 'green';
                discountedElement.textContent = `(Стоимость со скидкой: ${product.discountedPrice} руб.)`;

                productElement.appendChild(discountedElement);
            }

            productsContainer.appendChild(productElement);
        });

        // Разблокировка поля ввода промокода
        document.getElementById('promoCode').disabled = false;
    } else {
        // Если произошла ошибка при применении скидки
        if (result.message === 'Промокод уже введен') {
            discountResult.style.color = 'red';
            discountResult.textContent = 'Промокод уже введен';
            document.getElementById('promoCode').disabled = true;
        } else {
            discountResult.style.color = 'red';
            discountResult.textContent = result.message;
        }
    }
}

// Функция для сброса промокода
async function resetPromoCodeClient() {
    try {
        // Отправление запроса на сервер для сброса промокода
        const response = await fetch('/api/reset-promo-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        });

        // Получение результата запроса от сервера
        const result = await response.json();

        // Получение элементов DOM для отображения результата
        const discountResult = document.getElementById('discountResult');
        const productsContainer = document.getElementById('productsContainer');

        // Если сброс промокода выполнен успешно
        if (result.success) {
            // Отображение информации о сбросе промокода
            discountResult.style.color = 'green';
            discountResult.textContent = 'Промокод сброшен';

            // Очищение контейнера продуктов
            productsContainer.innerHTML = '';

            // Добавление обновленных продуктов на страницу
            result.updatedProducts.forEach(product => {
                const productElement = document.createElement('li');
                productElement.textContent = `${product.name} - ${product.price} руб.`;

                // Если есть скидка, добавляется информация о скидке
                if (product.discountedPrice !== product.price) {
                    const discountedElement = document.createElement('span');
                    discountedElement.style.color = 'green';
                    discountedElement.textContent = `(Стоимость со скидкой: ${product.discountedPrice} руб.)`;

                    productElement.appendChild(discountedElement);
                }

                productsContainer.appendChild(productElement);
            });

            // Разблокировка поля ввода промокода
            document.getElementById('promoCode').disabled = false;
        } else {
            // Если произошла ошибка при сбросе промокода
            console.error('Failed to reset promo code:', result.message);
        }
    } catch (error) {
        // Если произошла ошибка во время выполнения запроса
        console.error('Error resetting promo code:', error.message);
    }
}

module.exports = { applyDiscountClient, resetPromoCodeClient };