const express = require("express");
const { getDB } = require("./db");

const router = express.Router();

const toClient = (doc) => {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { ...rest, id: String(_id) };
};

router.get("/health", (req, res) => res.json({ ok: true }));

router.get("/categories/reading", async (req, res) => {
  const db = getDB();
  const items = await db.collection("categories").find({}).sort({ _id: 1 }).limit(50).toArray();
  res.json(items.map(toClient));
});

router.get("/posts/hero", async (req, res) => {
  const db = getDB();
  const item = await db.collection("posts").find({ type: "blog" }).sort({ _id: -1 }).limit(1).next();
  if (!item) return res.status(404).json({ message: "No hero post" });
  res.json(toClient(item));
});

function pageResponse(items, page, page_size, total) {
  return { items, meta: { page, page_size, total } };
}

router.get("/posts/related", async (req, res) => {
  const db = getDB();
  const page = Math.max(0, parseInt(req.query.page ?? "0", 10));
  const page_size = Math.min(10, Math.max(1, parseInt(req.query.page_size ?? "2", 10)));

  const q = { type: "blog" };
  const total = await db.collection("posts").countDocuments(q);

  const items = await db.collection("posts")
    .find(q)
    .sort({ _id: -1 })
    .skip(page * page_size)
    .limit(page_size)
    .toArray();

  res.json(pageResponse(items.map(toClient), page, page_size, total));
});

router.get("/posts/marketing", async (req, res) => {
  const db = getDB();
  const page = Math.max(0, parseInt(req.query.page ?? "0", 10));
  const page_size = Math.min(12, Math.max(1, parseInt(req.query.page_size ?? "4", 10)));

  const q = { type: "marketing" };
  const total = await db.collection("posts").countDocuments(q);

  const items = await db.collection("posts")
    .find(q)
    .sort({ _id: -1 })
    .skip(page * page_size)
    .limit(page_size)
    .toArray();

  res.json(pageResponse(items.map(toClient), page, page_size, total));
});

router.post("/newsletter/subscribe", async (req, res) => {
  const db = getDB();
  const email = String(req.body?.email || "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return res.status(400).json({ ok: false, message: "Email không hợp lệ." });
  }

  const col = db.collection("subscribers");
  if (await col.findOne({ email })) {
    return res.json({ ok: true, message: "Email đã được đăng ký trước đó." });
  }

  await col.insertOne({ email, created_at: new Date() });
  return res.json({ ok: true, message: "Đăng ký thành công!" });
});

module.exports = router;
