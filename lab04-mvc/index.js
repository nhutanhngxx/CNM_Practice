const express = require('express');
require('dotenv').config();
const AWS = require('aws-sdk');
const multer = require('multer');
const PORT = 3000;
const app = express();
// const multer = multer();

// Cấu hình DynamoDB
AWS.config.update({
    region: process.env.REGION, // Thay đổi theo khu vực của bạn
    accessKeyId: process.env.ACCESSKEY, // Lấy từ biến môi trường hoặc file .env
    secretAccessKey: process.env.SECRETKEY // Lấy từ biến môi trường hoặc file .env
});

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'Subject'; // Tên bảng DynamoDB của bạn

app.use(express.urlencoded({ extended: true }));
app.use(express.static('./views'));

app.set('view engine', 'ejs'); // Khai báo app dùng engine
app.set('views', './views'); // Nội dung render ở trang web

// Lấy danh sách tất cả các khóa học từ DynamoDB
app.get('/', (req, resp) => {
    const params = {
        TableName: tableName
    };

    docClient.scan(params, (err, data) => {
        if (err) {
            console.error("Unable to read items. Error JSON:", JSON.stringify(err, null, 2));
            return resp.status(500).send("Error fetching data from DynamoDB.");
        } else {
            return resp.render('index', { courses: data.Items });
        }
    });
});

// Lưu khóa học vào DynamoDB
app.post('/save', (req, resp) => {
    const id = req.body.id;
    const subjectName = req.body.subjectName;
    const courseType = req.body.courseType;
    const semester = req.body.semester;
    const department = req.body.department;

    const params = {
        TableName: tableName,
        Item: {
            id: id.toString(),
            subjectName: subjectName,
            courseType: courseType,
            semester: semester,
            department: department
        }
    };

    docClient.put(params, (err, data) => {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
            return resp.status(500).send("Error saving data to DynamoDB.");
        } else {
            return resp.redirect('/');
        }
    });
});

// Xóa khóa học khỏi DynamoDB
// Xóa khóa học khỏi DynamoDB
app.post('/delete', (req, resp) => {
    const { id, subjectName } = req.body; // Nhận cả id và subjectName từ form
    if (!id || !subjectName) {
        console.error("Error: Phải có cả id và subjectName.");
        return resp.status(400).send("Missing id or subjectName.");
    }

    console.log("Deleting item with id:", id, "and subjectName:", subjectName);

    const params = {
        TableName: tableName,
        Key: {
            id: id.trim(),                     // Partition Key
            subjectName: subjectName.trim()    // Sort Key
        }
    };

    docClient.delete(params, (err, data) => {
        if (err) {
            console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
            return resp.status(500).send("Error deleting data from DynamoDB.");
        } else {
            console.log("Item deleted successfully:", params.Key);
            return resp.redirect('/');
        }
    });
});



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
