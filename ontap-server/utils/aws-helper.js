require("dotenv").config();
const AWS = require("aws-sdk");
const s3 = new AWS.S3(); // Khởi tạo S3

// Cập nhật cấu hình AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamodb = new AWS.DynamoDB.DocumentClient(); // Khởi tạo DynamoDB DocumentClient
const tableName = "Article"; // Tên bảng DynamoDB mà bạn muốn truy vấn

module.exports = { s3, dynamodb, tableName }; // Xuất các đối tượng này để dùng ở các file khác
