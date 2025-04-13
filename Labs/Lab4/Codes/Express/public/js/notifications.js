document.addEventListener('DOMContentLoaded', () => {
    // Привязываем функцию к событию отправки формы
    document.getElementById('profile-form').addEventListener('submit', updateProfile);
    console.log('DOM полностью загружен и разобран');

    // Пример функции для отображения уведомлений
    function showNotification(message) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.style.display = 'block';
        notification.classList.add('success');
        
        // Скрыть уведомление через 3 секунды
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    // Функция для обновления профиля
    async function updateProfile(event) {
        event.preventDefault(); // Предотвращаем стандартное поведение формы

        const email = document.getElementById('email').value;
        const birthDate = document.getElementById('birthDate').value;

        // Валидация формы
        if (!email.includes('@')) {
            showNotification('Пожалуйста, введите корректный email.'); // Вызов функции
            return;
        }

        // Отправка данных на сервер
        try {
            const response = await fetch('/profile/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, birthDate }),
            });

            const result = await response.json();

            if (response.ok) {
                showNotification('Изменения успешно сохранены!'); // Вызов функции
            } else {
                showError(result.error || 'Произошла ошибка при обновлении профиля.'); // Вызов функции
            }
        } catch (error) {
            showNotification('Произошла ошибка при отправке данных.'); // Вызов функции
        }
    }

    function showError(message) {
        const error = document.getElementById('error');
        error.textContent = message;
        error.style.display = 'block';
        error.classList.add('error');

        setTimeout(() => {
            error.style.display = 'none';
        }, 5000);
    }
});