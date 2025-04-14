const users = []; // Хранилище пользователей

// Функция для добавления пользователя
exports.addUser  = (user) => {
    users.push(user);
};

// Функция для поиска пользователя по имени
exports.findUserByUsername = (username) => {
    return users.find(user => user.username === username);
};

// Функция для проверки существования никнейма
exports.nicknameExists = (nickname) => {
    return users.some(user => user.nickname === nickname);
};

// Функция для получения всех пользователей (если потребуется)
exports.getAllUsers = () => {
    return users;
};

module.exports = { users, addUser , findUserByUsername, nicknameExists, getAllUsers };
