// Функция для отображения уведомлений
document.getElementById('profile-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Предотвращаем стандартное поведение формы
    
    const userId = document.getElementById('userId').value;
    const nickname = document.getElementById('nickname').value;
    const email = document.getElementById('email').value;
    const birthDate = document.getElementById('birthDate').value;

    // Проверка уникальности никнейма
    const isNicknameUnique = await checkNickname(nickname);
    // Валидация формы
    if (!email.includes('@')) {
        showError('Пожалуйста, введите корректный email.');
        return; // Остановка отправки формы
    }


    // Отправка данных на сервер
    try {
        const response = await fetch('/profile/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, nickname, email, birthDate }), 
        });

        const result = await response.json();

        if (response.ok) {
            showNotification('Изменения успешно сохранены!');
        } else {
            showError(result.error || 'Произошла ошибка при обновлении профиля.');
        }
    } catch (error) {
        showError('Произошла ошибка при отправке данных.');
    }
});

// Функция для проверки уникальности никнейма
export async function checkNickname(nickname) {
    try {
        const response = await fetch('/profile/check-nickname', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nickname }),
        });
    
        const result = await response.json();
        return result.isUnique; // Предполагается, что сервер возвращает { isUnique: true/false }
    } catch (error) {
        console.error('Ошибка при проверке никнейма:', error);
        return false; // Если произошла ошибка, считаем, что никнейм не уникален
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Привязываем функции к событиям отправки форм
    document.getElementById('profile-form').addEventListener('submit', updateProfile);

    console.log('DOM полностью загружен и разобран');
});