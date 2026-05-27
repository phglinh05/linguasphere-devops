const mongoose = require("mongoose");
const { createApp } = require("./app");
const { seedIfEmpty } = require("./src/models/Blog");

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/linguasphere";

async function start() {
  await mongoose.connect(MONGODB_URI);
  await seedIfEmpty();
  const app = createApp();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start().catch(console.error);