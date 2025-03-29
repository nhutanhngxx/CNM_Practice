const express = require("express");
const router = express.Router();
const articleController = require("../controllers"); // Import controller

// Định tuyến cho bài viết
router.get("/", articleController.get); // GET request sẽ gọi phương thức `get` từ controller

module.exports = router;