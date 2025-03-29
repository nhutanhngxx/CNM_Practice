const express = require("express");
const AWS = require("aws-sdk");
const PORT = 3000;
const app = express();
const articleRoute = require("./routes/article.route"); // Khai báo

app.set("view engine", "ejs"); // Khai báo app dùng engine
app.set("views", "./views"); // Nội dung sẽ được render ở trang web

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./views")); // Render giao diện từ thư mục views

app.use("/articles", articleRoute); // Sau khi có các router phải đăng ký

app.get("/", (rep, resp) => {
  return resp.render("index");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
