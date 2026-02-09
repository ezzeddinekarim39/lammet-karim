require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// --- MIDDLEWARE ---
app.use(cors()); // Allow Frontend to connect

// INCREASE LIMIT to 50mb so you can upload high-quality images (Base64)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- DATABASE CONNECTION (NEON) ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon
  }
});

// --- INITIALIZE TABLES ---
const initDB = async () => {
  try {
    // Create Products Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        image_url TEXT
      );
    `);

    // Create Orders Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        items TEXT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Database Connected & Tables Ready");
  } catch (err) {
    console.error("❌ Database Error:", err);
  }
};

initDB();

// --- API ROUTES ---

// 1. Get All Products
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// 2. Add New Product (Supports Base64 Images)
app.post('/api/products', async (req, res) => {
  const { name, price, image_url } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO products (name, price, image_url) VALUES ($1, $2, $3) RETURNING *",
      [name, price, image_url]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// 3. Delete Product
app.delete('/api/products/:id', async (req, res) => {
  try {
    await pool.query("DELETE FROM products WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// 4. Place Order
app.post('/api/orders', async (req, res) => {
  const { customer_name, customer_phone, items, total_amount } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO orders (customer_name, customer_phone, items, total_amount) VALUES ($1, $2, $3, $4) RETURNING id",
      [customer_name, customer_phone, items, total_amount]
    );
    res.json({ success: true, orderId: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// 5. Get All Orders (For Admin Dashboard)
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM orders ORDER BY order_date DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// 6. Login Check (Simple Admin Logic)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  // You can change the password here
  if(username === "admin" && password === "123456") {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// --- START SERVER ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});