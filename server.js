const express=require('express');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const bodyParser=require('body-parser');
const cors=require('cors');
const sqlite3=require('sqlite3').verbose();
const axios=require('axios');
const app=express();
const PORT=3000;
const path=require('path');
app.use(express.static(path.join(__dirname)))
const JWT_SECRET='demo_secret_key';
const WEATHER_API_KEY='39253e8520b381571362fd69643fe1bf';
const PEXELS_API_KEY='tWyISYzE0Yo6HfKKGdedpC8H5XqedHUW8JAV9qcyu37eUwOvZWLvt9rm';

app.use(cors());
app.use(bodyParser.json());
//Initialize SQLite
const db=new sqlite3.Database('./database.sqlite', err => {
  if (err) return console.error(err.message);
  console.log('Connected to SQLite database.');
});
//if not exist,create a table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      avatar TEXT,
      address TEXT
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      query TEXT,
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);
});
function authenticateToken(req, res, next) {
  const authHeader=req.headers['authorization'];
  const token=authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user=user;
    next();
  });
}
//endpoint of resgister
app.post('/api/register', (req, res) => {
  const {username, password}=req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({error:'Server error'});
    db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hash],
      function(err) {
        if (err) return res.status(400).json({error: 'Username already exists'});
        res.status(201).json({ message:'User registered'});
      }
    );
  });
});
//endpoint of login
app.post('/api/login', (req, res) => {
  const {username, password}=req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).json({error: 'Server error'});
    if (!user) return res.status(400).json({error: 'Invalid credentials'});
    bcrypt.compare(password, user.password, (err, match) => {
      if (err || !match) return res.status(400).json({ error: 'Invalid credentials' });
      const token=jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '2h' });
      res.json({ token });
    });
  });
});
//Get user's history
app.get('/api/user/history', authenticateToken, (req, res) => {
  db.all('SELECT query FROM history WHERE userId = ?', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json(rows);
  });
});
//Add new history
app.post('/api/user/history', authenticateToken, (req, res) => {
  const { query }=req.body;
  db.run(
    'INSERT INTO history (userId, query) VALUES (?, ?)',
    [req.user.id, query],
    function(err) {
      if (err) return res.status(500).json({error: 'Server error'});
      res.status(201).json({ message: 'History saved' });
    }
  );
});
//Weather Data
app.get('/api/weather', async (req, res) => {
  const city=req.query.city;
  if (!city) return res.status(400).json({ error: 'City parameter is required' });
  try {
    const response=await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { q: city, appid: WEATHER_API_KEY, units: 'metric' }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({error: error.response?.data || 'Error fetching weather'});
  }
});
//Outfit images
app.get('/api/images', async (req, res)=>{
  const keyword=req.query.query;
  if (!keyword) return res.status(400).json({error: 'Query parameter is required'});
  try {
    const response=await axios.get('https://api.pexels.com/v1/search', {
      params: { query: keyword, per_page: 6 },
      headers: { Authorization: PEXELS_API_KEY }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({error: error.response?.data||'Error fetching images'});
  }
});
//Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
