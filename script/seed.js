const db = require('../db/index');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// ---------- 1️⃣ Create users table (if needed) ----------
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  pin TEXT
);
`);

// ---------- 2️⃣ Create products table (already exists) ----------
db.exec(`
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  category TEXT,
  categoryId TEXT,
  description TEXT,
  date TEXT,
  thmbnl TEXT,
  images TEXT,
  documents TEXT,
  contacts TEXT
);
`);

db.exec(`
CREATE TABLE IF NOT EXISTS records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  basicInfo TEXT,
  coreNeeds TEXT,
  projectConstraints TEXT,
  specialNeeds TEXT,
  createdAt TEXT
);
`);

// ---------- 3️⃣ Seed a user ----------
const username = 'admin';
const plainPin = '123456';
const hashedPin = bcrypt.hashSync(plainPin, 10);

const userExists = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

if (!userExists) {
  db.prepare('INSERT INTO users (username, pin) VALUES (?, ?)').run(username, hashedPin);
  console.log(`User "${username}" created with PIN ${plainPin}`);
} else {
  console.log(`User "${username}" already exists`);
}

// ---------- 4️⃣ Seed products from JSON ----------
const productsFile = path.join(__dirname, 'products.json');
const rawData = fs.readFileSync(productsFile, 'utf-8');
const products = JSON.parse(rawData);

const insertStmt = db.prepare(`
  INSERT INTO products
  (name, category, categoryId, description, date, thmbnl, images, documents, contacts)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

products.forEach((p) => {
  const exists = db.prepare('SELECT * FROM products WHERE name = ?').get(p.name);
  if (!exists) {
    insertStmt.run(
      p.name,
      p.category,
      p.categoryId,
      p.description,
      p.date,
      p.thmbnl || '',
      JSON.stringify(p.images || []),
      JSON.stringify(p.documents || []),
      JSON.stringify(p.contacts || [])
    );
    console.log(`Inserted product: ${p.name}`);
  } else {
    console.log(`Product "${p.name}" already exists`);
  }
});

console.log('Seeding completed!');
