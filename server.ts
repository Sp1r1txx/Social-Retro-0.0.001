import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("social_retro.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    display_name TEXT,
    bio TEXT,
    profile_pic TEXT,
    custom_bg TEXT DEFAULT '#f0f0f0',
    custom_color TEXT DEFAULT '#000000',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    image_url TEXT,
    caption TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    user_id INTEGER,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(post_id) REFERENCES posts(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER,
    user_id INTEGER,
    UNIQUE(post_id, user_id),
    FOREIGN KEY(post_id) REFERENCES posts(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    receiver_id INTEGER,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sender_id) REFERENCES users(id),
    FOREIGN KEY(receiver_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    author_id INTEGER,
    content TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(author_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS gifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receiver_id INTEGER,
    sender_id INTEGER,
    gift_type TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(receiver_id) REFERENCES users(id),
    FOREIGN KEY(sender_id) REFERENCES users(id)
  );
`);

// Seed a default user if none exists
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  db.prepare("INSERT INTO users (username, display_name, bio, profile_pic) VALUES (?, ?, ?, ?)").run(
    "retro_user",
    "Retro King",
    "Living in the 2000s forever. <3",
    "https://picsum.photos/seed/retro/200/200"
  );
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/users/:username", (req, res) => {
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(req.params.username);
    if (user) res.json(user);
    else res.status(404).json({ error: "User not found" });
  });

  app.get("/api/posts", (req, res) => {
    const posts = db.prepare(`
      SELECT posts.*, users.username, users.display_name, users.profile_pic,
      (SELECT COUNT(*) FROM likes WHERE post_id = posts.id) as likes_count,
      (SELECT COUNT(*) FROM comments WHERE post_id = posts.id) as comments_count
      FROM posts 
      JOIN users ON posts.user_id = users.id 
      ORDER BY posts.created_at DESC
    `).all();
    res.json(posts);
  });

  app.post("/api/posts", (req, res) => {
    const { user_id, image_url, caption } = req.body;
    const result = db.prepare("INSERT INTO posts (user_id, image_url, caption) VALUES (?, ?, ?)").run(user_id, image_url, caption);
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/posts/:id/comments", (req, res) => {
    const comments = db.prepare(`
      SELECT comments.*, users.username, users.display_name, users.profile_pic 
      FROM comments 
      JOIN users ON comments.user_id = users.id 
      WHERE post_id = ? 
      ORDER BY created_at ASC
    `).all(req.params.id);
    res.json(comments);
  });

  app.post("/api/comments", (req, res) => {
    const { post_id, user_id, content } = req.body;
    const result = db.prepare("INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)").run(post_id, user_id, content);
    res.json({ id: result.lastInsertRowid });
  });

  app.post("/api/likes", (req, res) => {
    const { post_id, user_id } = req.body;
    try {
      db.prepare("INSERT INTO likes (post_id, user_id) VALUES (?, ?)").run(post_id, user_id);
      res.json({ success: true });
    } catch (e) {
      db.prepare("DELETE FROM likes WHERE post_id = ? AND user_id = ?").run(post_id, user_id);
      res.json({ success: true, removed: true });
    }
  });

  app.get("/api/messages/:userId1/:userId2", (req, res) => {
    const messages = db.prepare(`
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `).all(req.params.userId1, req.params.userId2, req.params.userId2, req.params.userId1);
    res.json(messages);
  });

  app.post("/api/messages", (req, res) => {
    const { sender_id, receiver_id, content } = req.body;
    const result = db.prepare("INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)").run(sender_id, receiver_id, content);
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/testimonials/:userId", (req, res) => {
    const testimonials = db.prepare(`
      SELECT testimonials.*, users.username, users.display_name, users.profile_pic 
      FROM testimonials 
      JOIN users ON testimonials.author_id = users.id 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(req.params.userId);
    res.json(testimonials);
  });

  app.post("/api/testimonials", (req, res) => {
    const { user_id, author_id, content } = req.body;
    const result = db.prepare("INSERT INTO testimonials (user_id, author_id, content) VALUES (?, ?, ?)").run(user_id, author_id, content);
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/gifts/:userId", (req, res) => {
    const gifts = db.prepare(`
      SELECT gifts.*, users.username, users.display_name 
      FROM gifts 
      JOIN users ON gifts.sender_id = users.id 
      WHERE receiver_id = ? 
      ORDER BY created_at DESC
    `).all(req.params.userId);
    res.json(gifts);
  });

  app.post("/api/gifts", (req, res) => {
    const { receiver_id, sender_id, gift_type, message } = req.body;
    const result = db.prepare("INSERT INTO gifts (receiver_id, sender_id, gift_type, message) VALUES (?, ?, ?, ?)").run(receiver_id, sender_id, gift_type, message);
    res.json({ id: result.lastInsertRowid });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
