const users = []; // Хранилище пользователей

// Функция для добавления пользователя
const addUser  = (user) => {
    users.push(user);
};

// Функция для поиска пользователя по имени
const findUserByUsername = (username) => {
    return users.find(user => user.username === username);
};

// Функция для проверки существования никнейма
const nicknameExists = (nickname) => {
    return users.some(user => user.nickname === nickname);
};

// Функция для получения всех пользователей (если потребуется)
const getAllUsers = () => {
    return users;
};

// Экспортируем функции и массив пользователей
module.exports = { users, addUser , findUserByUsername, nicknameExists, getAllUsers };
