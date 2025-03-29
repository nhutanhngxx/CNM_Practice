const ArticleModel = require("../models/index");
const Controller = {};

// Lấy tất cả các article từ article table
Controller.get = async (request, response) => {
    try {
        const articles = await ArticleModel.getArticles();
        if (!articles) {
            return response.render("index", { articles: [] });
        }
        return response.render("index", { articles }); // Render view và truyền articles vào
    } catch (error) {
        console.log("Lỗi khi lấy bài viết:", error);
        return response.status(500).send("Lỗi không thể lấy được article");
    }
};

module.exports = Controller;