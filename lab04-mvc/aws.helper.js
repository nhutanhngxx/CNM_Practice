require("dotenv").config();
const AWS = require('aws-sdk');

AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.ACCESSKEY,
    secretAccessKey: process.env.SECRETKEY,
});

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'Subject';

// Các hàm trợ giúp cho các hoạt động DynamoDB

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
    queryTable
};
