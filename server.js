const express = require('express');
// const session = require('express-session');
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




// // Authentication middleware
// function requireAuth(req, res, next) {
//   if (req.session.userId) {
//       // User is authenticated
//       next();
//   } else {
//       // User is not authenticated, redirect to sign-in page
//       req.session.returnTo = req.originalUrl; // Store original URL
//       res.redirect('/signin');
//   }
// }




// const SECRET_KEY = process.env.SESSION_SECRET || 'default-secret-key';

// app.use(session({
//   secret: SECRET_KEY,
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: true }
// }));


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



app.post('/signup', (req, res) => {
  const { username, fullName, email, password } = req.body;

  // Hash the password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
          console.error('Error hashing password:', err);
          res.send('Error signing up');
          return;
      }

      const sql = `INSERT INTO users (user_id, full_name, email, password) VALUES (?, ?, ?, ?)`;
      db.query(sql, [username, fullName, email, hashedPassword], (err, result) => {
          if (err) {
              console.error('Error inserting user:', err);
              res.send('Error signing up');
              return;
          }

          // Send account creation email
          sendAccountCreationEmail(email);

          // Send signup success message as an alert
          res.send(`
                  <script>
                      alert('Signup successful! An email has been sent to notify you.');
                   window.location.href = '/'; // Redirect to homepage or any other page
                  </script>
`);
      });
  });
});


app.get('/login', (req, res) => {
  res.render('login', { message: '' });
});

app.get('/login', (req, res) => {
  req.session.returnTo = req.header('Referer') || '/';
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
              res.redirect(req.session.returnTo || '/profile');
          } else {
              // Passwords don't match
              res.render('login', { message: 'Invalid username or password. Please try again.' });
          }
      });
  });
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




app.get('/items', (req, res) => {
  // Get the category ID from the query parameters
  const categoryId = req.query.category;

  // Query items from the database that belong to the specified category
  const sql = 'SELECT * FROM items WHERE category_id = ?';
  db.query(sql, [categoryId], (err, items) => {
      if (err) {
          console.error('Error querying items:', err);
          res.status(500).send('Internal Server Error');
          return;
      }
      // Render the items.ejs template with the filtered items
      res.render('items', { items });
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


























const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});