const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Регистрация
router.post('/register', authController.registerUser);

// Определяем маршрут для проверки уникальности никнейма
router.post('/check-nickname', authController.checkNickname);

// Вход
router.post('/login', authController.loginUser);

// Профиль
router.get('/profile', authController.profile);

// Выход
router.get('/logout', authController.logout);

// Обновление профиля
router.post('/update', authController.updateProfile);

// Редактирование профиля
router.get('/edit', authController.editProfile);

module.exports = router;
