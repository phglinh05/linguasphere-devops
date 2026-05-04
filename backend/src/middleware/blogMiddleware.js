function parsePagination(req, res, next) {
  req.page = Math.max(0, parseInt(req.query.page ?? "0", 10));
  req.pageSize = Math.min(12, Math.max(1, parseInt(req.query.page_size ?? "4", 10)));
  next();
}

function validateEmail(req, res, next) {
  const email = String(req.body?.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return res.status(400).json({ ok: false, message: "Invalid email." });
  }
  req.email = email;
  next();
}

module.exports = { parsePagination, validateEmail };