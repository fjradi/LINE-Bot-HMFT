var Cronofy = require('cronofy');
var moment = require('moment');
//Cronofy token
var client = new Cronofy({
    access_token: process.env.CRONOFY_TOKEN,
});
//timezone setting
var options = {
    tzid: 'Asia/Jakarta'
};
//momentjs vars
now = moment().format("MMMM Do YYYY");
tomorrow = moment().add(1, "d");
week = moment().startOf('week');

var agenda = (time, callback) => {
    client.readEvents(options)
        .then(function (response) {
            var events = response.events;
            //today events
            if (time === 'agenda'){
                var todayAgenda = [];
                events.forEach((event) => {
                    var eventStart = moment(event.start).format("MMMM Do YYYY");
                    if (now === eventStart) {
                        todayAgenda.push({
                            name: event.summary,
                            date: moment(event.start).format("dddd")
                        });
                    }
                });
                callback(todayAgenda);
            }
            //tomorrow events
            else if (time === 'agenda besok'){
                var tomorrowAgenda = [];
                events.forEach((event) => {
                    if (tomorrow.diff(event.start, "hours") >= 0 && tomorrow.diff(event.start, "hours") < 24) {
                        tomorrowAgenda.push({
                            name: event.summary,
                            date: moment(event.start).format("dddd")
                        });
                    }
                });
                callback(tomorrowAgenda);
            }
            //this week events
            else if (time === 'agenda minggu'){
                var weekAgenda = [];
                events.forEach((event) => {
                    var eventStart = moment(event.start);
                    if (eventStart.diff(week, "hours") >= 0 && eventStart.diff(week, "hours") < 168) {
                        weekAgenda.push({
                            name: event.summary,
                            date: moment(event.start).format("dddd")
                        });
                    }
                });
                callback(weekAgenda);
            }
        });
}

module.exports = {
    agenda
}
