## Основные команды тестирования Jest

Чтобы запустить тесты только для конкретного файла, используйте команду:

```bash
npm test путь/к/тестовому/файлу
```

Например:

1. Для тестов App:
```bash
npm test src/App.test.js
```

2. Для тестов MovieListPage:
```bash
npm test src/pages/MovieList/MovieListPage.test.js
```

3. Для тестов MovieFormPage:
```bash
npm test src/pages/MovieForm/MovieFormPage.test.js
```

Чтобы сосредоточиться на конкретных ошибках, давайте пройдемся по каждому файлу:

---

### 1. Ошибки в App.test.js
**Ошибка:**
```error
ReferenceError: React is not defined
```

**Решение:**
Добавить импорт React в AuthContext.jsx:
```javascript
// В файле src/context/AuthContext.jsx
import React from 'react'; // Добавить эту строку
```

**Проверка:**
```bash
npm test src/App.test.js
```

---

### 2. Ошибки в MovieListPage.test.js
**Ошибка:**
```error
Unable to find an element with the text: Test Movie
```

**Причина:** 
- Мокированный сервис не возвращает данные
- Неправильная структура компонента
- Отсутствие ожидания загрузки данных

**Решение:**
Обновите тест:
```javascript
test('renders movie information', async () => {
  fetchMovies.mockResolvedValueOnce([mockMovie]); // Явный мок
  
  render(
    <AuthProvider>
      <NotificationProvider>
        <MovieListPage />
      </NotificationProvider>
    </AuthProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
  });
});
```

**Проверка:**
```bash
npm test src/pages/MovieList/MovieListPage.test.js
```

---

### 3. Ошибки в MovieFormPage.test.js
**Ошибка:**
```error
Unable to find a label with the text of: Название
```

**Причины:**
- Компонент не успевает отрендериться
- Неправильные селекторы
- Проблемы с мокированием провайдеров

**Решение:**
Добавьте async/await и обновите селекторы:
```javascript
test('renders form with all fields', async () => {
  render(
    <AuthProvider>
      <NotificationProvider>
        <MovieFormPage />
      </NotificationProvider>
    </AuthProvider>
  );

  await waitFor(() => {
    expect(screen.getByLabelText('Название')).toBeInTheDocument();
  });
});
```

**Проверка:**
```bash
npm test src/pages/MovieForm/MovieFormPage.test.js
```

---

### Общие рекомендации:
1. **Для изоляции тестов:**
   ```bash
   npm test -- путь/к/файлу
   ```

2. **Для отладки конкретного теста:**
   ```bash
   npm test -- путь/к/файлу -t 'название теста'
   ```
   Пример:
   ```bash
   npm test -- src/App.test.js -t 'renders learn react link'
   ```

3. **Полезные флаги:**
   ```bash
   --watchAll  # Режим наблюдения
   --verbose    # Подробный вывод
   ```

Дайте знать, если нужно углубиться в конкретную ошибку. Для эффективной отладки лучше фокусироваться на одном тестовом файле за раз.