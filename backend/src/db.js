const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const { MongoClient } = require("mongodb");

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME || "linguasphere";

let client;
let db;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function connectDB() {
  if (db) return db;
  if (!MONGO_URL) throw new Error("Missing MONGO_URL env");

  const maxRetries = 20;
  for (let i = 1; i <= maxRetries; i++) {
    try {
      client = new MongoClient(MONGO_URL, {
        serverSelectionTimeoutMS: 8000,
      });
      await client.connect();
      db = client.db(DB_NAME);
      console.log("MongoDB connected (Atlas)");
      return db;
    } catch (err) {
      console.log(`Mongo not ready (try ${i}/${maxRetries}): ${err?.message || err}`);
      await sleep(1000);
    }
  }
  throw new Error("Cannot connect to MongoDB after retries");
}

function getDB() {
  if (!db) throw new Error("DB not connected yet");
  return db;
}

module.exports = { connectDB, getDB };
