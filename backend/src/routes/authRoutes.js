const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController")
const authMiddleware = require("../midlleware/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/verify", authMiddleware, (req, res) => {
    res.json({ authenticated: true, userId: req.user.id });
});

module.exports = router;
