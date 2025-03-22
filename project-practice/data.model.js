const awsHelper = require('./aws.helper');
const { uploadFileToS3 } = require('./aws.helper');

class Subject {
    constructor(id, subjectName, courseType, semester, department, image) {
        this.id = id;  // id của subject, sẽ được chuyển thành chuỗi khi lưu vào DynamoDB
        this.subjectName = subjectName;
        this.courseType = courseType;
        this.semester = semester;
        this.department = department;
        this.image = image;
    }

    // Phương thức tạo mới subject trong DynamoDB
    create() {
        try {
            // Bước 1: Tải file ảnh lên S3
            if (this.image) {
                const s3Data = await uploadFileToS3(this.image);  // Tải ảnh lên S3
                this.image = s3Data.Location; // Cập nhật đường dẫn ảnh đã upload lên S3
            }

            // Bước 2: Dữ liệu subject cần tạo
            const subjectData = {
                id: this.id.toString(),  // Chuyển id thành chuỗi nếu nó là số (Do DynamoDB đang lưu là String)
                subjectName: this.subjectName,
                courseType: this.courseType,
                semester: this.semester,
                department: this.department,
                image: this.image // Đảm bảo đây là URL của ảnh đã upload lên S3
            };

            // Bước 3: Lưu subject vào DynamoDB
            await awsHelper.createItem(subjectData);
            return 'Subject created successfully';
        } catch (error) {
            throw new Error('Error creating subject: ' + error.message);
        }
    }


    // Phương thức tìm subject theo id
    getById(id) {
        return new Promise((resolve, reject) => {
            const key = { id: id.toString() };  // Đảm bảo id là chuỗi (Do DynamoDB đang lưu là String)
            awsHelper.getItem(key)
                .then((subjectData) => {
                    if (subjectData) {
                        resolve(new Subject(subjectData.id, subjectData.subjectName, subjectData.courseType, subjectData.semester, subjectData.department, subjectData.image));
                    } else {
                        resolve(null);  // Trả về null nếu không tìm thấy subject
                    }
                })
                .catch((error) => reject('Error retrieving subject: ' + error));
        });
    }

    // Phương thức cập nhật subject
    update(updateData) {
        return new Promise((resolve, reject) => {
            const key = { id: this.id.toString() };  // Chuyển id thành chuỗi (Do DynamoDB đang lưu là String)
            const updateExpression = 'set #subjectName = :subjectName, #courseType = :courseType, #semester = :semester, #department = :department';
            const expressionValues = {
                ':subjectName': updateData.subjectName || this.subjectName,  // Nếu không có giá trị mới thì giữ nguyên
                ':courseType': updateData.courseType || this.courseType,
                ':semester': updateData.semester || this.semester,
                ':department': updateData.department || this.department,
            };

            awsHelper.updateItem(key, updateExpression, expressionValues)
                .then(() => resolve('Subject updated successfully'))
                .catch((error) => reject('Error updating subject: ' + error));
        });
    }

    // Phương thức xóa subject
    delete() {
        return new Promise((resolve, reject) => {
            const key = { id: this.id.toString() };  // Chuyển id thành chuỗi
            awsHelper.deleteItem(key)
                .then(() => resolve('Subject deleted successfully'))
                .catch((error) => reject('Error deleting subject: ' + error));
        });
    }

    // Phương thức lấy tất cả subjects từ DynamoDB
    static getAll() {
        return new Promise((resolve, reject) => {
            awsHelper.scanTable()
                .then((subjectsData) => {
                    const subjects = subjectsData.map(subjectData => new Subject(
                        subjectData.id,
                        subjectData.subjectName,
                        subjectData.courseType,
                        subjectData.semester,
                        subjectData.department
                    ));
                    resolve(subjects);
                })
                .catch((error) => reject('Error scanning subjects: ' + error));
        });
    }
}

module.exports = Subject;
