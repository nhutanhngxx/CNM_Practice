const { dynamodb, tableName } = require("../utils/aws-helper");

const ArticleModel = {
    // Lấy tất cả bài viết từ DynamoDB
    getArticles: async () => {
        const params = {
            TableName: tableName,
        };
        try {
            const result = await dynamodb.scan(params).promise(); // Scan bảng DynamoDB
            return result.Items; // Trả về danh sách các bài viết
        } catch (error) {
            console.error("Lỗi khi lấy bài viết từ DynamoDB:", error);
            throw error; // Ném lỗi nếu có vấn đề
        }
    },
    
    // Thêm mới bài viết vào DynamoDB
    createArticle: async (article) => {
        const params = {
            TableName: tableName,
            Item: article,
        };

        try {
            await dynamodb.put(params).promise(); // Lưu bài viết vào DynamoDB
        } catch (error) {
            console.error("Lỗi khi thêm bài viết vào DynamoDB:", error);
            throw error; // Ném lỗi nếu có vấn đề
        }
    }
};

module.exports = ArticleModel;