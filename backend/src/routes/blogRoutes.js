const express = require("express");
const router = express.Router();

const blogController = require("../controllers/blogController");
const blogMiddleware = require("../middleware/blogMiddleware");

router.get("/health", blogController.health);
router.get("/posts/hero", blogController.hero);
router.get("/categories/reading", blogController.categories);
router.get("/posts/related", blogMiddleware.parsePagination, blogController.related);
router.get("/posts/marketing", blogMiddleware.parsePagination, blogController.marketing);
router.post("/newsletter/subscribe", blogMiddleware.validateEmail, blogController.subscribe);

module.exports = router;