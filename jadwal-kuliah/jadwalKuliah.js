const mongoose = require('mongoose');
const moment = require('moment');
//connect to MongoDB Atlas
mongoose.Promise = global.Promise;
mongoose.connect(process.env.DATABASEURL, { useNewUrlParser: true, dbName: 'CollegeSchedule' });
//Course schema
var courseSchema = new mongoose.Schema({
    name: String,
    semester: Number,
    timeAndRoom: [{
        class: Number,
        room: String,
        day: String,
        start: Number,
        end: Number
    }]
}, { collection: 'courses' });
var Course = mongoose.model('Courses', courseSchema);

var schedule = (time, callback) => {
    var keyword = time.split(" ");  //slice message with space delimiter to array
    //tomorrow schedule
    if (keyword[0] === 'jadwal' && keyword[1] === 'besok') {
        if ((parseInt(keyword[2]) >= 2) && (parseInt(keyword[2]) <= 6) && (parseInt(keyword[3]) >= 1) && (parseInt(keyword[3]) <= 2)) {
            var findBy = {
                day: moment().add(1, "d").format("dddd"),
                semester: parseInt(keyword[2]),
                class: parseInt(keyword[3])
            }
        }
        else {
            callback(undefined, 'Pastikan range semester 3-6 dan kelas 1-2');
            return;
        }
    }
    //today schedule
    else if (keyword[0] === 'jadwal') {
        if ((parseInt(keyword[1]) >= 2) && (parseInt(keyword[1]) <= 6) && (parseInt(keyword[2]) >= 1) && (parseInt(keyword[2]) <= 2)) {
            var findBy = {
                day: moment().format("dddd"),
                semester: parseInt(keyword[1]),
                class: parseInt(keyword[2])
            }
        }
        else {
            callback(undefined, 'Pastikan range semester 3-6 dan kelas 1-2');
            return;
        }
    }
    //error handling if today is Saturday/Sunday
    if (findBy.day === 'Saturday' || findBy.day === 'Sunday') {
        callback(undefined, 'Tidak ada kelas di hari Sabtu dan Minggu');
        return;
    }
    //find related courses
    Course.aggregate([
        { "$match": { semester: findBy.semester} },
        { "$unwind": "$timeAndRoom" },
        { "$match": { "timeAndRoom.day": findBy.day, "timeAndRoom.class": findBy.class } }
    ]).sort("timeAndRoom.start").exec((err, courses) => {
        if (err) {
            console.log(err);
            return
        }
        else {
            callback(courses, undefined);
        }
    })
}

module.exports = {
    schedule
}