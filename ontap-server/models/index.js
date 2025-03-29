const { dynamodb, tableName } = require("../utils/aws-helper");

const ArticleModel = {
  getArticles: async () => {
    const params = {
      TableName: tableName, // Định nghĩa tên bảng cần truy vấn
    };
    try {
      const result = await dynamodb.scan(params).promise(); // Scan bảng DynamoDB để lấy tất cả dữ liệu
      return result.Items; // Trả về danh sách các bài viết lấy được
    } catch (error) {
      console.error("Lỗi khi lấy bài viết từ DynamoDB:", error);
      throw error; // Ném lỗi nếu có vấn đề
    }
  },
};

module.exports = ArticleModel;
