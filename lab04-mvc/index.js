const express = require('express');
const PORT = 3000;
const app = express();
let courses = require('./data');


app.use(express.urlencoded({extended: true}))
app.use(express.static('./views'));

app.set('view engine', 'ejs'); // Khai báo app dùng engine
app.set('views', './views') // Nội dung render ở trang web

app.get('/', (req, resp) => {
    return resp.render('index', {courses})
});

app.post('/save', (req, resp) => {
    const id = Number(req.body.id);
    const name = req.body.name;
    const course_type = req.body.course_type;
    const semester = req.body.semester;
    const department = req.body.department;

    const params = {
        "id": id,
        "name": name,
        "course_type": course_type,
        "semester": semester,
        "department": department
    }

    courses.push(params);
    return resp.redirect('/');
})

app.post('/delete', (req, resp) => {
    const idToDelete = Number(req.body.id);

    courses = courses.filter(course => course.id !== idToDelete);

    return resp.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});