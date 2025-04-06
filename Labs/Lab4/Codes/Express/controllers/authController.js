const bcrypt = require('bcrypt');
const passport = require('passport');

let users = []; // Хранилище пользователей

// Регистрация пользователя
exports.registerUser  = (req, res) => {
    const { username, password } = req.body;
    const existingUser  = users.find(u => u.username === username);
    if (existingUser ) {
        return res.status(400).send('Пользователь с таким именем уже существует.');
    }
    
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).send('Ошибка хеширования пароля');
        }
        
        const newUser  = { username, password: hashedPassword };
        users.push(newUser );
        
        req.login(newUser , (err) => {
            if (err) return res.status(500).send('Ошибка входа');
            return res.redirect('/auth/profile');
        });
    });
};

// Вход пользователя
exports.loginUser  = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return res.status(500).send('Ошибка аутентификации');
        if (!user) return res.status(401).send('Неверное имя пользователя или пароль');
        
        req.login(user, (err) => {
            if (err) return res.status(500).send('Ошибка входа');
            return res.send(`Добро пожаловать, ${user.username}!`);
        });
    })(req, res, next);
};

// Профиль пользователя
exports.profile = (req, res) => {
    if (req.isAuthenticated()) {
        return res.render('profile', { username: req.user.username });
    } else {
        return res.redirect('/login');
    }
};

// Выход пользователя
exports.logout = (req, res) => {
    req.logout();
    res.redirect('/auth/login');
};
