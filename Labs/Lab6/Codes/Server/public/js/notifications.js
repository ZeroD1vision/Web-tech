/*document.addEventListener('DOMContentLoaded', () => {
    // Привязываем функцию к событию отправки формы
    document.getElementById('profile-form').addEventListener('submit', updateProfile);
    // Привязываем функцию к событию отправки формы входа
    document.getElementById('login-form').addEventListener('submit', loginUser );

    console.log('DOM полностью загружен и разобран');*/

// Функция для отображения уведомления
export function showNotification(message) {
    const notification = document.getElementById('notification');
    if (!notification) return;
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Функция для отображения ошибки
export function showError(message) {
    const error = document.getElementById('error');
    if (!error) return;
    error.textContent = message;
    error.style.display = 'block';
    setTimeout(() => {
        error.style.display = 'none';
    }, 5000);
}

// Функция для обработки отправки формы логина
export async function loginUser (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/profile/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();

        if (response.ok) {
            showNotification(result.message);
            setTimeout(() => {
                window.location.href = '/profile/profile';
            }, 1200);
        } else {
            showError(result.error || 'Произошла ошибка при входе.');
        }
    } catch (error) {
        showError('Произошла ошибка при отправке данных.');
    }
}

export async function checkIfAdmin() {
    try {
        const response = await fetch ('/profile/check-admin', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!user.ok) {
            showError('Пользователь не авторизован');
            return; // Завершаем выполнение функции, если пользователь не авторизован
        }

        const result = await response.json();

        if(response.ok){
            // Если пользователь администратор, выполняем нужные действия
            if (result.isAdmin) {
                showNotification('Вы являетесь администратором.');
                // Здесь можно добавить дополнительную логику для администраторов
            } else {
                showError('У вас нет прав администратора.');
            }
        } else {
            showError(result.error || 'Произошла ошибка при проверке прав.');
        }
    } catch (error) {
        showError('Произошла ошибка при отправке данных.');
    }
}

// Ждем загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    // Привязываем функции к событиям отправки форм
    document.getElementById('login-form').addEventListener('submit', loginUser );

    console.log('DOM полностью загружен и разобран');
});
/*
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

    function showError(message) {
        const error = document.getElementById('error');
        error.textContent = message;
        error.style.display = 'block';
        error.classList.add('error');

        setTimeout(() => {
            error.style.display = 'none';
        }, 5000);
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

    // Функция для входа пользователя
    async function loginUser (event) {
       event.preventDefault(); // Предотвращаем стандартное поведение формы
       const username = document.getElementById('username').value;
       const password = document.getElementById('password').value;
       // Отправка данных на сервер
       try {
           const response = await fetch('/profile/login', {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json',
               },
               body: JSON.stringify({ username, password }),
           });
           const result = await response.json();
           if (response.ok) {
               showNotification(result.message); // Успешное сообщение
               window.location.href = '/profile/profile'; // Перенаправление на профиль
           } else {
               showError(result.error || 'Произошла ошибка при входе.'); // Ошибка
           }
       } catch (error) {
           showError('Произошла ошибка при отправке данных.'); // Ошибка отправки
       }
    }
});*/