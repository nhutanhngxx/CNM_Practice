const express = require("express");
const app = express();

const articleRoute = require("./article.route"); // Định tuyến bài viết

app.use("/articles", articleRoute); // Đăng ký định tuyến cho URL "/articles"

module.exports = app;
