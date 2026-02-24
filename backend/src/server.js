require("dotenv").config();
const express = require("express");
const cors = require("cors");
const router = require("./routes");
const { connectDB } = require("./db");
const { seedIfEmpty } = require("./seed");

const PORT = process.env.PORT || 8000;
const CORS_ORIGINS = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",").map(s => s.trim()).filter(Boolean);

async function main() {
  const app = express();
  app.use(cors({ origin: CORS_ORIGINS, credentials: true }));
  app.use(express.json());

  const db = await connectDB();
  await seedIfEmpty(db);

  app.use(router);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend running on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
