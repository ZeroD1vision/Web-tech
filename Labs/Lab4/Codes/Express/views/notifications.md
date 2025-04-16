# Инструкция по работе с уведомлениями

## Подключение уведомлений
### Файл `public/views/file.ejs`:
Сначала идет весь файл, только потом этот блок:

 ```html
    <!-- Блоки уведомлений -->
    <div id="notification"></div>
    <div id="error"></div>

    <script type="module" defer>
        import { loginUser  } from '/js/notifications.js';

        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('login-form').addEventListener('submit', loginUser );
        });
    </script>
 ```
### Файл `public/js/file.js`:
 ```js
export function func1 () {}
export function func2 () {}
export function func3 () {}

document.addEventListener('DOMContentLoaded', () => {
    // Привязываем функции к событиям отправки форм
    document.getElementById('id1').addEventListener('submit', func1);
    document.getElementById('id2').addEventListener('submit', func2);

    console.log('DOM полностью загружен и разобран');
});
 ```