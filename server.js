const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server is working!');
});

app.get('/api/games', (req, res) => {
    res.json([]);
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    res.json({ success: true, username: username });
});

app.post('/api/register', (req, res) => {
    res.json({ success: true, message: 'Registered successfully' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
