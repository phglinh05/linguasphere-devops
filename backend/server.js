require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const blogRoutes = require("./src/routes/blogRoutes");
const authRoutes = require("./src/routes/authRoutes");
const { authPageMiddleware } = require("./src/middleware/authMiddleware");
const Blog = require("./src/models/Blog");

const PORT = process.env.PORT || 8000;

const CORS_ORIGINS = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

async function main() {
  const app = express();

  app.use(cors({ origin: CORS_ORIGINS, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  // static frontend
  app.use(express.static(path.join(__dirname, "../frontend")));

  // MongoDB connect
  await mongoose.connect(process.env.MONGO_URL, {
    dbName: process.env.DB_NAME || "devsecops",
  });

  console.log("MongoDB connected");

  // seed blog data
  await Blog.seedIfEmpty();

  // API routes
  app.use("/api/blog", blogRoutes);
  app.use("/api/auth", authRoutes);

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/pages/auth.html"));
  });

  app.get("/dashboard", authPageMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/pages/blog.html"));
  });

  app.get("/health", (req, res) => res.json({ ok: true }));

  app.listen(PORT, "0.0.0.0", () =>
    console.log(`Backend running on port ${PORT}`)
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});