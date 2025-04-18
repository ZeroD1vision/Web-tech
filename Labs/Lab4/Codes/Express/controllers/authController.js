const bcrypt = require('bcrypt');
const passport = require('passport');
const { pool, addUserToDB, findUserByUsernameInDB, nicknameExists } = require('../config/db');


// Регистрация пользователя
/*exports.registerUser  = async (req, res) => {
    console.log('Регистрация пользователя:', req.body);
    const { username, password } = req.body;

    // Генерируем уникальный никнейм для нового пользователя
    const randomname = generateGuestNickname();

    const existingUser  = await findUserByUsernameInDB(username);
    if (existingUser ) {
        return res.status(400).send('Пользователь с таким именем уже существует.');
    }
    
    bcrypt.hash(password, 10, async (err, hashedPassword) => {
        console.log('Please help');
        if (err) {
            return res.status(500).send('Ошибка хеширования пароля');
        }
        
        const newUser  = { username, 
                           nickname: randomname, 
                           password: hashedPassword };

        await addUserToDB(newUser );

        console.log('Пользователи после регистрации:', users); // Логируем массив пользователей
        
        req.login(newUser , (err) => {
            if (err) return res.status(500).send('Ошибка входа');
            console.log('Переходим на страницу профиля');
            return res.redirect('/profile/profile');
        });
    });
};*/
exports.registerUser  = async (req, res) => {
    console.log('Регистрация пользователя:', req.body);
    const { username, password } = req.body;
    console.log('Регистрация пользователя 2:', req.body);

    // Генерируем уникальный никнейм для нового пользователя
    const randomname = generateGuestNickname();
    console.log('Регистрация пользователя 3:', req.body);

    try {
        const existingUser  = await findUserByUsernameInDB(username);
        console.log('Регистрация пользователя 3:', req.body);
        if (existingUser ) {
            console.log('Регистрация пользователя 4:', req.body);
            return res.status(400).send('Пользователь с таким именем уже существует.');
        }
        console.log('Регистрация пользователя 5:', req.body);

        // Используем await для хеширования пароля
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Регистрация пользователя 6:', req.body);

        const newUser  = { username, nickname: randomname, password: hashedPassword };
        console.log('Регистрация пользователя 7:', req.body);

        // Добавляем пользователя в базу данных и получаем его данные
        const createdUser  = await addUserToDB(newUser);
        console.log(createdUser);
        
        if (!createdUser) {
            return res.status(500).send('Ошибка при создании пользователя');
        }

        req.login(createdUser, (err) => {
            if (err) {
                console.error('Ошибка входа:', err);
                return res.status(500).send('Ошибка входа');
            }
            console.log('Переходим на страницу профиля');
            return res.redirect('/profile/profile');
        });
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        return res.status(500).send('Произошла ошибка при регистрации.');
    }
};

// Функция для генерации уникального никнейма
const generateGuestNickname = async () => {
    let baseNickname = 'guest';
    let number = 1000;
    console.log('Регистрация пользователя 8:');

    // Проверяем существующие никнеймы
    //while (users.some(user => user.nickname === `${baseNickname}${number}`)) {
        console.log('Регистрация пользователя 9:');
    while (await nicknameExists(`${baseNickname}${number}`)) {
        number++;
    }
    console.log('Регистрация пользователя 10:');

    return `${baseNickname}${number}`;
};

// Проверка уникальности никнейма
exports.checkNickname = async (req, res) => {
    const { nickname, currentNickname } = req.body;

    // Если новый никнейм совпадает с текущим, возвращаем, что он уникален
    if (nickname === currentNickname) {
        return res.json({ isUnique: true });
    }

    try {
        const exists = await nicknameExists(nickname); // Проверяем уникальность
        res.json({ isUnique: !exists });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при проверке никнейма.' });
    }
};

// Вход пользователя
exports.loginUser  = (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
        console.log('Вход пользователя (controller)');

        // Обработка ошибок аутентификации
        if (err) {
            console.error('Ошибка аутентификации:', err);
            return res.status(500).json({ error: 'Ошибка аутентификации' });
        }
        
        // Проверка, найден ли пользователь
        if (!user) {
            console.log('Неверное имя пользователя или пароль');
            return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
        }

        // Логиним пользователя
        req.logIn(user, (err) => {
            if (err) {
                console.error('Ошибка при входе:', err);
                return res.status(500).json({ error: 'Ошибка входа' });
            }

            // Успешный вход
            console.log('Успешный вход:', user);
            return res.status(200).json({ message: 'Успешный вход!', userId: user.id }); // Отправка успешного сообщения с идентификатором пользователя
        });
    })(req, res, next);
};

// Профиль пользователя
exports.profile = (req, res) => {
    if (req.isAuthenticated()) {
        return res.render('auth/profile', { user: req.user });
    } else {
        return res.redirect('/profile/login');
    }
};

// Выход пользователя
exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).send('Ошибка при выходе из системы');
        }
        res.redirect('/profile/login');

    });
};

// Обновление профиля
exports.updateProfile = async (req, res) => {
    const userId = req.user.id; // Используем ID пользователя из сессии
    const { nickname, email, birthDate } = req.body;

    try {
        /*Без БД 
        Находим пользователя в массиве пользователей по имени пользователя
        const userID = users.findIndex(u => u.username === req.user.username); // Или используйте другой уникальный идентификатор
        if (userID === -1) {
            return res.status(404).json({ error: 'Пользователь не найден.' });
        }

        // Обновляем данные пользователя
        users[userID].nickname = nickname; // Обновление псевдонима
        users[userID].email = email;
        users[userID].birthDate = new Date(birthDate); // Преобразование строки в объект Date*/
        const currentUser = await pool.query('SELECT nickname FROM users WHERE id = \$1', [userId]);
        console.log(userId);
        
        if (currentUser.rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден.' });
        }

        const currentNickname = currentUser.rows[0].nickname;

        // Если никнейм не изменился, просто обновляем другие поля
        if (nickname === currentNickname) {
            await pool.query(
                'UPDATE users SET email = \$1, birthDate = \$2 WHERE id = \$3',
                [email, new Date(birthDate), userId]
            );
            return res.json({ success: 'Ваш профиль успешно обновлен!' });
        }

        // Если никнейм изменился проверяем уникальность 
        const exists = await nicknameExists(nickname);
        if (exists) {
            return res.status(400).json({ error: 'Никнейм уже существует.' });
        }

        // Обновляем никнейм и другие поля
        await pool.query(
            'UPDATE users SET nickname = \$1, email = \$2, birthDate = \$3 WHERE id = \$4',
            [nickname, email, new Date(birthDate), userId]
        );

        // Отправляем сообщение об успехе
        console.log('Отправляемые данные:', { nickname, email, birthDate });
        return res.json({ success: 'Ваш профиль успешно обновлен!' });
    } catch (err) {
        console.error(err);
        // Сообщение об ошибке
        return res.status(500).json({ error: 'Произошла ошибка при обновлении профиля. Попробуйте еще раз.' });
    }
};

// Редактирование профиля
exports.editProfile = (req, res) => {
    if (req.isAuthenticated()) {
        return res.render('auth/edit', { 
            user: req.user,
            successMessage: '', // Успешные сообщения теперь будут передаваться через JSON
            errorMessage: '' // Ошибки тоже
        });
    } else {
        return res.redirect('profile/login');
    }
};