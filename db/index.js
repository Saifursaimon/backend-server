const Database  = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, 'database.db'))

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
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    pin TEXT NOT NULL
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

module.exports = db