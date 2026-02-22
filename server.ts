import express from "express";
import { createServer as createViteServer } from "vite";
import db from "./src/db.ts";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.use(express.json());

  // --- API Routes ---
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (user) {
      res.json({ success: true, user });
    } else {
      const info = db.prepare('INSERT INTO users (email, password, name, avatar) VALUES (?, ?, ?, ?)').run(
        email, 
        password, 
        email.split('@')[0], 
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      );
      const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
      res.json({ success: true, user: newUser });
    }
  });

  app.get("/api/books", (req, res) => {
    const books = db.prepare('SELECT * FROM books').all();
    res.json(books);
  });

  app.get("/api/books/trending", (req, res) => {
    const books = db.prepare('SELECT * FROM books WHERE is_trending = 1').all();
    res.json(books);
  });

  app.get("/api/books/:id", (req, res) => {
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ error: "Book not found" });
    }
  });

  app.get("/api/library/:userId", (req, res) => {
    const library = db.prepare(`
      SELECT b.*, l.progress, l.last_read 
      FROM library l 
      JOIN books b ON l.book_id = b.id 
      WHERE l.user_id = ?
    `).all(req.params.userId);
    res.json(library);
  });

  app.post("/api/payments/create-session", (req, res) => {
    const { bookId, userId } = req.body;
    db.prepare('INSERT OR IGNORE INTO library (user_id, book_id) VALUES (?, ?)').run(userId, bookId);
    res.json({ success: true, checkoutUrl: "#" });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
