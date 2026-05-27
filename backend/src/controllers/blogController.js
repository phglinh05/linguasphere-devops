const Blog = require("../models/Blog");

exports.health = (req, res) => res.json({ ok: true });

exports.hero = async (req, res) => {
  try {
    const data = await Blog.getHero();
    if (!data) return res.status(404).json({ message: "No hero post" });
    res.json(data);
  } catch (err) {
    console.error("Hero error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.categories = async (req, res) => {
  try {
    res.json(await Blog.getCategories());
  } catch (err) {
    console.error("Categories error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.related = async (req, res) => {
  try {
    res.json(await Blog.getRelated(req.page, req.pageSize));
  } catch (err) {
    console.error("Related error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.marketing = async (req, res) => {
  try {
    res.json(await Blog.getMarketing(req.page, req.pageSize));
  } catch (err) {
    console.error("Marketing error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.subscribe = async (req, res) => {
  try {
    res.json(await Blog.subscribe(req.email));
  } catch (err) {
    console.error("Subscribe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};