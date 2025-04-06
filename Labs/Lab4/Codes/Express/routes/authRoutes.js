const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Регистрация
router.post('/register', authController.registerUser );

// Вход
router.post('/login', authController.loginUser );

// Профиль
router.get('/profile', authController.profile);

// Выход
router.get('/logout', authController.logout);

module.exports = router;
