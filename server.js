const express = require('express');
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
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
  connectionLimit: 20 // Adjust as per your requirement
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
  connection.release(); // Release the connection
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


// Route to handle adding an item
app.post('/add-item', async (req, res) => {
  const { id, name, price, description, category_id, image_url } = req.body;

  // Log the details collected
  console.log("Received item details:");
  console.log("ID:", id);
  console.log("Name:", name);
  console.log("Price:", price);
  console.log("Description:", description);
  console.log("Category ID:", category_id);
  console.log("Image URL:", image_url);

  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Execute the query using the connection
    const [results] = await connection.query(
      'INSERT INTO items (id, name, price, description, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, price, description, category_id, image_url]
    );

    // Release the connection back to the pool
    connection.release();

    // Redirect to a success page or display a success message
    res.send('<script>alert("Item added successfully!"); window.location.href = "/";</script>');
  } catch (error) {
    console.error('Error adding item:', error);
    // Display an error message as an alert on the screen
    res.send('<script>alert("Failed to add item. Please try again later."); window.location.href = "/add-product";</script>');
  }
});


app.get('/items', async (req, res) => {
  try {
    // Get the category ID from the query parameters
    const categoryId = req.query.category;

    // Query items from the database that belong to the specified category
    const [rows] = await pool.query('SELECT * FROM items WHERE category_id = ?', [categoryId]);

    // Render the items.ejs template with the filtered items
    res.render('items', { items: rows });
  } catch (error) {
    console.error('Error querying items:', error);
    res.status(500).send('Internal Server Error');
  }
});




app.get('/products/search', (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter "query" is required' });
  }
  
  // Query database for items matching the search query
  const sql = `SELECT * FROM items WHERE name LIKE ? OR description LIKE ?`;
  const params = [`%${query}%`, `%${query}%`];
  connection.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error executing database query: ' + err.stack);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(results);
  });
});


// Route to fetch all products from the database
app.get('/all-products', async (req, res) => {
  try {
    // Query all products from the database
    const [rows] = await pool.query('SELECT * FROM items');
    
    // Randomize the order of products
    const randomizedProducts = rows.sort(() => Math.random() - 0.5);
    
    // Render the all-products.ejs template with randomized products
    res.render('all-products', { products: randomizedProducts });
  } catch (error) {
    console.error('Error querying products:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/checkout', async (req, res) => {
  try {
    // Extract user ID from the request body
    const userId = req.body.userId;

    // Query the database to check if the user exists
    const [rows] = await pool.query('SELECT * FROM users WHERE user_id = ?', [userId]);

    // Check if any rows were returned
    if (rows.length > 0) {
      // User exists in the database
      res.json({ exists: true });
    } else {
      // User does not exist in the database
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking user in database:', error);
    res.status(500).send('Error checking user in database');
  }
});


// Render profile.ejs when /profile route is accessed
app.get('/all-products', (req, res) => {
  res.render('all-products'); // Assuming profile.ejs is in your views directory
});



// // Endpoint to check if user exists in the database
// app.post('/checkUser', (req, res) => {
//   console.log('Received request to check user.');

//   const userId = req.body.userId;
//   console.log('User ID from request:', userId);

//   pool.query('SELECT * FROM users WHERE user_id = ?', [userId], (error, results) => {
//     if (error) {
//       console.error('Error checking user in database:', error);
//       res.status(500).send('Error checking user in database');
//     } else {
//       if (results.length > 0) {
//         // User exists in database
//         console.log('User exists in database');
//         res.json({ exists: true });
//       } else {
//         // User does not exist in database
//         console.log('User does not exist in database');
//         res.json({ exists: false });
//       }
//     }
//   });
// });



// // Endpoint to check if user exists in the database
// app.post('/checkUser', (req, res) => {
//   const userId = req.body.userId;
//   pool.query('SELECT * FROM users WHERE user_id = ?', [userId], (error, results) => {
//     if (error) {
//       console.error('Error checking user in database:', error);
//       res.status(500).send('Error checking user in database');
//     } else {
//       if (results.length > 0) {
//         // User exists in database
//         res.json({ exists: true });
//       } else {
//         // User does not exist in database
//         res.json({ exists: false });
//       }
//     }
//   });
// });



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
