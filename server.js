const express = require('express');
const session = require('express-session');
require('dotenv').config();
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const app = express();
const nodemailer = require('nodemailer');

app.set('view engine', 'ejs');
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));

// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Session middleware configuration
// const SECRET_KEY = process.env.SESSION_SECRET || 'default-secret-key';
// app.use(session({
//   secret: SECRET_KEY,
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: true }
// }));

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});
db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
});



app.get('/login', (req, res) => {
  req.session.returnTo = req.query.redirectTo || '/';
  res.render('login', { message: '' });
});


// Route handler for POST request to /login (process login form submission)
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Query the database to verify user's credentials
  const sql = 'SELECT * FROM users WHERE user_id = ?';
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      res.render('login', { message: 'An error occurred. Please try again later.' });
      return;
    }

    // Check if a user with the provided username exists
    if (results.length === 0) {
      // No user found with the provided username
      res.render('login', { message: 'Invalid username or password. Please try again.' });
      return;
    }

    // User found, verify password
    const user = results[0];
    bcrypt.compare(password, user.password, (bcryptErr, bcryptResult) => {
      if (bcryptErr) {
        console.error('Error comparing passwords:', bcryptErr);
        res.render('login', { message: 'An error occurred. Please try again later.' });
        return;
      }

      if (bcryptResult) {
        // Passwords match, set session data for authenticated user
        req.session.user = { username: user.username }; // Store username in session
        // Redirect back to previous page or default to profile page
        res.redirect(req.session.returnTo || '/');

      } else {
        // Passwords don't match
        res.render('login', { message: 'Invalid username or password. Please try again.' });
      }
    });
  });
});



app.get('/profile', (req, res) => {
  // Check if the user is authenticated (check session data)
  if (req.session.user) {
    // User is logged in
    const username = req.session.user.username;
    // Pass user information to the profile page
    res.render('profile', { username });
  } else {
    // User is not logged in, redirect to login page
    res.redirect('/login');
  }
});

// Function to send account creation email
function sendAccountCreationEmail(email) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Welcome to Nkwegu medicals',
    text: 'Hello,\n\nYour account has been successfully created. Thank you for signing up!'
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending account creation email:', error);
    } else {
      console.log('Account creation email sent:', info.response);
    }
  });
}

// Other routes and server setup...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
