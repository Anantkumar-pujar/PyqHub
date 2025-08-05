const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();
const pool = require('./config/db');

const PORT = process.env.APP_PORT;

// Session
app.use(session({
  store: new pgSession({ pool }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 12 },
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'js')));
app.use(express.static(path.join(__dirname, 'css')));
app.use('/temp', express.static(path.join(__dirname, 'temp')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Routes
app.use('/', require('./routes/authRoutes'));
app.use('/', require('./routes/uploadRoutes'));
app.use('/', require('./routes/dashboardRoutes'));
app.use('/', require('./routes/searchRoutes'));
app.use('/', require('./routes/passwordRoutes'));
app.use('/', require('./routes/homeRoutes'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/landing.html');
});

// Catch-all 404
app.use((req, res) => {
  res.status(404).send('Page not found');
});

app.listen(PORT, () => {
  console.log(`Server running on ${process.env.APP_URL}`);
});