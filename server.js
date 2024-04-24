const express = require('express');
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
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: 10 // Adjust as per your requirement
});

// Route handler for GET request to /signup (render signup form)
app.get('/signup', (req, res) => {
  res.render('signup');
});

// Route handler for POST request to /signup (process signup form submission)
app.post('/signup', async (req, res) => {
  const { username, fullName, email, password } = req.body;

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await pool.query(
      'INSERT INTO users (user_id, full_name, email, password) VALUES (?, ?, ?, ?)',
      [username, fullName, email, hashedPassword]
    );

    // Send account creation email
    sendAccountCreationEmail(email);

    // Send signup success message as an alert
    res.send(`
      <script>
        alert('Signup successful! An email has been sent to notify you.');
        window.location.href = '/';
      </script>
    `);
  } catch (error) {
    console.error('Error signing up:', error);
    res.send('<script>alert("Error signing up. Please try again later."); window.location.href = "/signup";</script>');
  }
});

// Route handler for GET request to /login (render login form)
app.get('/login', (req, res) => {
  res.render('login', { message: '' });
});

// Route handler for POST request to /login (process login form submission)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Check if the user is an admin based on the provided credentials
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    // Admin credentials match, render add-products.ejs
    res.render('add-products');
    return;
  }

  try {
    const [user] = await pool.query('SELECT * FROM users WHERE user_id = ?', [username]);

    if (!user) {
      res.render('login', { message: 'Invalid username or password. Please try again.' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      // Passwords match, redirect to another-page.html
      res.redirect('/another-page.html');
    } else {
      // Passwords don't match
      res.render('login', { message: 'Invalid username or password. Please try again.' });
    }
  } catch (error) {
    console.error('Error querying database:', error);
    res.render('login', { message: 'An error occurred. Please try again later.' });
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

// Other routes and handlers...





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














// Route to handle adding a product
app.post('/add-product', async (req, res) => {
  const { id, name, price, description, category, image_url } = req.body;

  try {
    // Get a connection from the pool
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('Error getting database connection:', err);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Execute the query using the connection
      connection.query(
        'INSERT INTO items (id, name, price, description, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?)',
        [id, name, price, description, category, image_url],
        (error, results) => {
          // Release the connection back to the pool
          connection.release();

          if (error) {
            console.error('Error adding product:', error);
            // Display an error message as an alert on the screen
            res.send('<script>alert("Failed to add product. Please try again later."); window.location.href = "/add-product";</script>');
            return;
          }

          // Redirect to a success page or display a success message
          res.send('<script>alert("Product added successfully!"); window.location.href = "/";</script>');
        }
      );
    });
  } catch (error) {
    console.error('Error adding product:', error);
    // Display an error message as an alert on the screen
    res.send('<script>alert("Failed to add product. Please try again later."); window.location.href = "/add-product";</script>');
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});






