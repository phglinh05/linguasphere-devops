const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const blogRoutes = require("./src/routes/blogRoutes");
const authRoutes = require("./src/routes/authRoutes");
const Blog = require("./src/models/Blog");

const PORT = process.env.PORT || 5000;

async function main() {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());
  
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME || "devsecops",
  });

  console.log("MongoDB connected");

  // seed blog data
  await Blog.seedIfEmpty();

  // API routes
  app.use("/api/blog", blogRoutes);
  app.use("/api/auth", authRoutes);

  app.get("/health", (req, res) => res.json({ ok: true }));

  app.listen(PORT, "0.0.0.0", () =>
    console.log(`Backend running on port ${PORT}`)
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});