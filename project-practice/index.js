const express = require("express");
require("dotenv").config();
const AWS = require("aws-sdk");
const multer = require("multer");
const path = require("path");
const { uploadFileToS3, createItem } = require("./aws.helper");
const PORT = 3000;
const app = express();

// Cấu hình DynamoDB
AWS.config.update({
  region: process.env.REGION,
  accessKeyId: process.env.ACCESSKEY,
  secretAccessKey: process.env.SECRETKEY,
});

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = "Subject"; // Tên bảng DynamoDB của bạn

app.use(express.urlencoded({ extended: true }));
app.use(express.static("./views"));

app.set("view engine", "ejs"); // Khai báo app dùng engine
app.set("views", "./views"); // Nội dung render ở trang web

// Cấu hình multer lưu file tạm thời trong thư mục uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Thư mục lưu trữ ảnh tạm thời
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Tạo tên file mới tránh trùng
  },
});

const upload = multer({ storage: storage });

// Middleware xử lý form-data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Lấy danh sách tất cả các khóa học từ DynamoDB
app.get("/", (req, resp) => {
  const params = {
    TableName: tableName,
  };

  docClient.scan(params, (err, data) => {
    if (err) {
      console.error(
        "Unable to read items. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      return resp.status(500).send("Error fetching data from DynamoDB.");
    } else {
      return resp.render("index", { courses: data.Items });
    }
  });
});

// Route xử lý upload ảnh
app.post("/save", upload.single("image"), async (req, res) => {
  try {
    const { id, subjectName, courseType, semester, department } = req.body;
    let imageUrl = null;

    console.log("Received data:", req.body);

    if (req.file) {
      console.log("Uploading file:", req.file.path);
      const s3Data = await uploadFileToS3(req.file.path);
      imageUrl = s3Data.Location;
      console.log("File uploaded successfully:", imageUrl);
    }
    const newSubject = {
      id,
      subjectName,
      courseType,
      semester,
      department,
      image: imageUrl,
    };
    await createItem(newSubject);
    return res.redirect("/");
  } catch (error) {
    console.error("Upload error:", error); // Log lỗi chi tiết
    res.status(500).json({ error: `Error uploading image: ${error.message}` });
  }
});

// Xóa khóa học khỏi DynamoDB
app.post("/delete", (req, resp) => {
  const { id, subjectName } = req.body; // Nhận cả id và subjectName từ form
  if (!id || !subjectName) {
    console.error("Error: Phải có cả id và subjectName.");
    return resp.status(400).send("Missing id or subjectName.");
  }
  console.log("Deleting item with id:", id, "and subjectName:", subjectName);
  const params = {
    TableName: tableName,
    Key: {
      id: id.trim(), // Partition Key
      subjectName: subjectName.trim(), // Sort Key
    },
  };
  docClient.delete(params, (err, data) => {
    if (err) {
      console.error(
        "Unable to delete item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      return resp.status(500).send("Error deleting data from DynamoDB.");
    } else {
      console.log("Item deleted successfully:", params.Key);
      return resp.redirect("/");
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
