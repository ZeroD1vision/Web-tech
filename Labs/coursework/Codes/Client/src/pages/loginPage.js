import React from 'react';

const LoginPage = () => {
    return (
        <div>
            <h1>Вход</h1>
            <form action="/profile/login" method="POST">
                <input type="text" name="username" placeholder="Имя пользователя" required />
                <input type="password" name="password" placeholder="Пароль" required />
                <button type="submit">Войти</button>
            </form>
        </div>
    );
};

export default LoginPage;
