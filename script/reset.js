const db = require('../db/index');

console.log('⚠️  RESETTING DATABASE...');

/* ---------- DROP TABLES (ORDER MATTERS) ---------- */
db.exec(`
DROP TABLE IF EXISTS records;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;
`);

console.log('✅ Tables dropped');

/* ---------- RECREATE USERS TABLE ---------- */
db.exec(`
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  pin TEXT
);
`);

console.log('✅ users table recreated');

/* ---------- RECREATE PRODUCTS TABLE ---------- */
db.exec(`
CREATE TABLE products (
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

console.log('✅ products table recreated');

/* ---------- RECREATE RECORDS TABLE ---------- */
db.exec(`
CREATE TABLE records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  basicInfo TEXT,
  coreNeeds TEXT,
  projectConstraints TEXT,
  specialNeeds TEXT,
  createdAt TEXT
);
`);

console.log('✅ records table recreated');

console.log('🎉 DATABASE RESET COMPLETE');
console.log('👉 Now run: node seed.js');
