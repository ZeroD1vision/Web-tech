const users = require('../models/userModel'); // Модель пользователя, если используем базу данных
const bcrypt = require('bcrypt');
const passport = require('passport');

// Регистрация пользователя
exports.registerUser  = (req, res) => {
    console.log('Регистрация пользователя:', req.body);
    const { username, password } = req.body;
    const existingUser  = users.find(u => u.username === username);
    if (existingUser ) {
        return res.status(400).send('Пользователь с таким именем уже существует.');
    }
    
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        console.log('Please help');
        if (err) {
            return res.status(500).send('Ошибка хеширования пароля');
        }
        
        const newUser  = { username, password: hashedPassword };
        users.push(newUser );

        console.log('Пользователи после регистрации:', users); // Логируем массив пользователей
        
        req.login(newUser , (err) => {
            if (err) return res.status(500).send('Ошибка входа');
            console.log('Переходим на страницу профиля');
            return res.redirect('/profile');
        });
    });
};

// Вход пользователя
exports.loginUser  = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => { // Обработка результата newLocalStrategy
        console.log('Вход пользователя(controller)');
        if (err) return res.status(500).send('Ошибка аутентификации');
        if (!user) return res.status(401).send('Неверное имя пользователя или пароль');
        
        req.logIn(user, (err) => {
            if (err) return res.status(500).send('Ошибка входа');
            return res.redirect('/profile'); // Перенаправление на профиль после успешного входа
        });
    })(req, res, next);
};

// Профиль пользователя
exports.profile = (req, res) => {
    if (req.isAuthenticated()) {
        return res.render('auth/profile', { user: req.user });
    } else {
        return res.redirect('/login');
    }
};

// Выход пользователя
exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).send('Ошибка при выходе из системы');
        }
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).send('Ошибка при уничтожении сессии');
            }
            res.redirect('/login');
        });
    });
};
