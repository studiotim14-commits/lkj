const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Пример роута для логина, который ждет твой скрипт
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    // Здесь твоя логика проверки логина/пароля
    res.json({ success: true, username: username });
});

// Пример роута для регистрации
app.post('/api/register', (req, res) => {
    res.json({ success: true, message: 'Registered successfully' });
});

// Пример роута для получения игр
app.get('/api/games', (req, res) => {
    res.json([]);
});

// Запуск сервера с привязкой к '0.0.0.0' для корректной работы на Railway
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
