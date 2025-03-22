require("dotenv").config();
const fs = require('fs');               // Để kiểm tra file
const path = require('path');           // Để xử lý đường dẫn file
const mime = require('mime-types');     // Để lấy MIME type của file
const AWS = require('aws-sdk');         // Để làm việc với S3
const s3 = new AWS.S3();

AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.ACCESSKEY,
    secretAccessKey: process.env.SECRETKEY,
});

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'Subject';


const uploadFileToS3 = async (filePath) => {
    console.log("Checking if file exists:", filePath);
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }
    console.log("Reading file...");
    const fileContent = fs.readFileSync(filePath);
    const fileName = `course-images/${Date.now()}-${path.basename(filePath)}`;
    const mimeType = mime.lookup(filePath);
    
    if (!mimeType) {
        throw new Error('Unsupported file type');
    }

    console.log(`Uploading ${fileName} with type ${mimeType}...`);
    
    const uploadParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: fileName,
        Body: fileContent,
        ContentType: mimeType,
    };

    try {
        const data = await s3.upload(uploadParams).promise();
        console.log('File uploaded successfully:', data.Location);
        return data;
    } catch (err) {
        console.error('Error uploading file:', err);
        throw new Error(`Error uploading to S3: ${err.message}`);
    }
};

async function createItem(item) {
    const params = {
        TableName: tableName,
        Item: item
    };
    
    try {
        await docClient.put(params).promise();
        console.log("Item created successfully");
    } catch (error) {
        console.error("Error creating item: ", error);
        throw new Error("Error creating item");
    }
}

async function getItem(key) {
    const params = {
        TableName: tableName,
        Key: key
    };

    try {
        const data = await docClient.get(params).promise();
        return data.Item;
    } catch (error) {
        console.error("Error getting item: ", error);
        throw new Error("Error getting item");
    }
}

async function updateItem(key, updateExpression, expressionValues) {
    const params = {
        TableName: tableName,
        Key: key,
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionValues,
        ReturnValues: "UPDATED_NEW"
    };

    try {
        const data = await docClient.update(params).promise();
        console.log("Item updated successfully:", data);
        return data;
    } catch (error) {
        console.error("Error updating item: ", error);
        throw new Error("Error updating item");
    }
}

async function deleteItem(idToDelete, subjectName) {
    if (!idToDelete || !subjectName) {
        console.error("Error: Cần truyền đủ cả id và subjectName.");
        return;
    }

    const params = {
        TableName: tableName,
        Key: {
            id: idToDelete.toString().trim(),  // Partition Key
            subjectName: subjectName.toString().trim() // Sort Key
        }
    };

    try {
        await dynamoDb.delete(params).promise();
        console.log("Item deleted successfully:", JSON.stringify(params.Key));
    } catch (err) {
        console.error("Error deleting item:", JSON.stringify(err, null, 2));
    }
}


async function scanTable() {
    const params = {
        TableName: tableName
    };

    try {
        const data = await docClient.scan(params).promise();
        return data.Items;
    } catch (error) {
        console.error("Error scanning table: ", error);
        throw new Error("Error scanning table");
    }
}

async function queryTable(queryParams) {
    try {
        const data = await docClient.query(queryParams).promise();
        return data.Items;
    } catch (error) {
        console.error("Error querying table: ", error);
        throw new Error("Error querying table");
    }
}

module.exports = {
    createItem,
    getItem,
    updateItem,
    deleteItem,
    scanTable,
    queryTable,
    uploadFileToS3
};
