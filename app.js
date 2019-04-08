'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const agendaHimp = require('./agenda-himp/agendaHimp.js');
const jadwalKuliah = require('./jadwal-kuliah/jadwalKuliah.js');

const defaultAccessToken = '***********************';
const defaultSecret = '***********************';

// create LINE SDK config from env variables
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || defaultAccessToken,
    channelSecret: process.env.CHANNEL_SECRET || defaultSecret,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
const app = express();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});

// event handler
function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }
    //help feature
    if (event.message.text === 'help'){
        var replyText = 'Fitur bot:';
        replyText += '\n- Agenda himpunan hari ini => "agenda"';
        replyText += '\n- Agenda himpunan besok => "agenda besok"';
        replyText += '\n- Agenda himpunan minggu ini => "agenda minggu"';
        replyText += '\n- Jadwal kuliah hari ini => "jadwal <semester> <kelas>"';
        replyText += '\n- Jadwal kuliah besok => "jadwal besok <semester> <kelas>"';
        return client.replyMessage(event.replyToken, { type: 'text', text: replyText });
    }
    //Himpunan (student association) events feature
    else if (event.message.text.includes('agenda')){
        agendaHimp.agenda(event.message.text, (result) => {
            var replyText = '';
            if (event.message.text === 'agenda') {
                replyText += 'Agenda himpunan hari ini:\n';
            }
            else if (event.message.text === 'agenda besok') {
                replyText += 'Agenda himpunan besok:\n';
            }
            else if (event.message.text === 'agenda minggu') {
                replyText += 'Agenda himpunan minggu ini:\n';
            }
            if (result.length === 0){
                replyText += '\nTidak ada';
            }
            result.forEach((agenda) => {
                replyText += '\n- ' + agenda.name + ' (' + agenda.date + ')';
            }); 
            return client.replyMessage(event.replyToken, { type: 'text', text: replyText });
        });
    }
    //College schedule event
    else if (event.message.text.includes('jadwal')){
        jadwalKuliah.schedule(event.message.text, (result, err) => {
            var replyText = '';
            if (err){
                replyText = err;
            }
            else{
                replyText = 'Jadwal kuliah';
                if (event.message.text.includes('jadwal besok')) {
                    replyText += ' besok:\n';
                }
                else if (event.message.text.includes('jadwal')) {
                    replyText += ' hari ini:\n';
                }
                result.forEach((schedule) => {
                    replyText += '\n- ' + schedule.name + ' (' + schedule.timeAndRoom.room + ') (' + schedule.timeAndRoom.start + '-' + schedule.timeAndRoom.end + ')';
                });
            }
            return client.replyMessage(event.replyToken, { type: 'text', text: replyText });
        })
    }
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});