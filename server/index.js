require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// --- 1. MIDDLEWARE ---
app.use(cors()); // Allow Frontend to connect

// INCREASE LIMIT to 50mb so you can upload high-quality images (Base64)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- 2. DATABASE CONNECTION (NEON POSTGRES) ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon
  }
});

// --- 3. INITIALIZE TABLES (With Auto-Update) ---
const initDB = async () => {
  try {
    // Create Products Table (if not exists)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        category TEXT,
        description TEXT,
        image_url TEXT
      );
    `);

    // --- AUTO-FIX: Add new columns if they are missing ---
    // This allows you to keep your old data while adding the new features!
    await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;`);
    await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;`);

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
    console.log("✅ Database Connected & Tables Updated");
  } catch (err) {
    console.error("❌ Database Error:", err);
  }
};

initDB();

// --- 4. API ROUTES ---

// GET All Products
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// GET All Orders (For Admin Dashboard)
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM orders ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// ADD New Product (POST)
app.post('/api/products', async (req, res) => {
  // Now accepts category and description
  const { name, price, category, description, image_url } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO products (name, price, category, description, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, price, category, description, image_url]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// --- NEW: UPDATE Product (PUT) ---
// This fixes the "Error saving item" when editing
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, category, description, image_url } = req.body;

  try {
    const result = await pool.query(
      `UPDATE products
       SET name = $1, price = $2, category = $3, description = $4, image_url = $5
       WHERE id = $6 RETURNING *`,
      [name, price, category, description, image_url, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// DELETE Product
app.delete('/api/products/:id', async (req, res) => {
  try {
    await pool.query("DELETE FROM products WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// PLACE Order
app.post('/api/orders', async (req, res) => {
  const { customer_name, customer_phone, items, total_amount } = req.body;
  try {
    // Ensure items is a string (JSON) before saving
    const itemsString = typeof items === 'object' ? JSON.stringify(items) : items;

    const result = await pool.query(
      "INSERT INTO orders (customer_name, customer_phone, items, total_amount) VALUES ($1, $2, $3, $4) RETURNING id",
      [customer_name, customer_phone, itemsString, total_amount]
    );
    res.json({ success: true, orderId: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// LOGIN Check
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if(username === "admin" && password === "123456") {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// --- START SERVER ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});