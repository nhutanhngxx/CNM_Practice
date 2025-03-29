const ArticleModel = require("../models/index");
const Controller = {};

// Lấy tất cả các article từ bảng DynamoDB
Controller.get = async (req, resp) => {
  try {
    const articles = await ArticleModel.getArticles(); // Gọi model để lấy bài viết
    return resp.render("index", { articles }); // Trả danh sách articles cho giao diện
  } catch (error) {
    console.error("Lỗi khi lấy bài viết:", error);
    return resp.status(500).send("Lỗi không thể lấy được bài viết");
  }
};

module.exports = Controller;
