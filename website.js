const express = require('express');
const remarkable = require('express-remarkable');
const hbs = require('hbs');
const moment = require('moment');
const env = require('./env');
const db = require('./db');
const time = require('./time');

const tz = env.TIMEZONE;

const app = express();
const stat = express();

stat.set('view engine', 'hbs');

hbs.registerHelper('stars', function(number) {
  const n = Number(number) || 0;
  const out = '★'.repeat(n);
  return out;
});

hbs.registerHelper('ftime', function(ctime) {
  return time.format(ctime);
});

app.engine('md', remarkable(app));
app.set('views', './');
app.set('view engine', 'md');

app.use(express.static('public'));

app.get("/ping", (req, res) => {
  res.sendStatus(200);
});

app.get("/", function (request, response) {
  response.render('README');
});

// Environment Variables Encoder/Decoder
app.get("/env", (req, res) => {
  res.sendFile(__dirname + '/views/env.html');
});

app.get("/txt", (req, res) => {
  res.sendFile(__dirname + '/views/botan.txt');
});

stat.get('/bintang', (req, res) => {
  db.then(function({ stars }) {
    let data = { stars: stars.chain().simplesort('number', true).data() };
    res.render('bintang', data);
  });
});

stat.get('/fakta', (req, res) => {
  db.then(function({ facts }) {
    let data = { facts: facts.chain().data() };
    res.render('fakta', data);
  });
});

stat.get('/kelihatan', (req, res) => {
  db.then(function({ last_message }) {
    let data = { last_message: last_message.chain().data() };
    res.render('kelihatan', data);
  });
});

app.use('/stat', stat);


function start() {
  const listener = app.listen(process.env.PORT, function () {
    console.log('Your app is listening on port ' + listener.address().port);
  });
}

exports.start = start;