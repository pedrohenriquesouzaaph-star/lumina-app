import Database from 'better-sqlite3';

const db = new Database('lumina.db');

// Criando as tabelas iniciais
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    avatar TEXT
  );

  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    author TEXT,
    description TEXT,
    price REAL,
    cover_url TEXT,
    category TEXT,
    pages INTEGER,
    rating REAL,
    readers_count INTEGER,
    is_trending INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS library (
    user_id INTEGER,
    book_id INTEGER,
    progress INTEGER DEFAULT 0,
    last_read DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, book_id)
  );
`);

export default db;
