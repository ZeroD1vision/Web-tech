let users = []; // Хранилище пользователей

// Функция для добавления пользователя
exports.addUser  = (user) => {
    users.push(user);
};

// Функция для поиска пользователя по имени
exports.find_user_by_username = (username) => {
    return users.find(user => user.username === username);
};

// Функция для получения всех пользователей (если потребуется)
exports.getAllUsers = () => {
    return users;
};
