const keys = require('./keys.json');
const _ = require('lodash');
const path = require('path');
const http = require('http');
const https = require('https');
const request = require('request');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.argv[2] || 54123;
const SandCastle = require('sandcastle').SandCastle;
const sandcastle = new SandCastle();

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));

const Twilio = require('twilio');
const twilio  = new Twilio(keys.twilio.sid, keys.twilio.secret);
const MessagingResponse = Twilio.twiml.MessagingResponse;

const cats = require('./data/cats.json');

/*
twilio.messages.create({
   body: 'Hello from Node 2',
   to: '+16822131240',  // Text this number
   from: '+12056145066' // From a valid Twilio number
}).then((message) => console.log(message.sid));
*/

app.get('/', (req, res) => {
   res.sendfile('public/index.html');
});

app.get('/list', (req, res) => {
   res.sendfile('public/list.html');
});

app.post('/sms', (req, res) => {
   const response = new MessagingResponse();
   const message = response.message();

   const text = req.body.Body.toLowerCase();
   const words = text.split(/\s/g);

   if (words.indexOf('cat') >= 0 || words.indexOf('cats') >= 0) {
      message.body(cats.all[Math.floor(Math.random() * 160)].text);
      request.get('https://aws.random.cat/meow', function (err, data, body) {
         if (err) console.log(err);
         message.media(JSON.parse(data.body).file);
         res.writeHead(200, {'Content-Type': 'text/xml'});
         res.end(message.toString());
      });
   } else if (words.indexOf('weather') >= 0) {
      let index = words.indexOf('in');
      let city = 'Denton'
      if (index >= 0 && index != words.length - 1) {
         city = '';
         ++index;
         while  (index < words.length) {
            city += ' ' + words[index];
            ++index;
         }
      }
      city = city.trim().replace(/[^A-Za-z ]/g, '');
      request.get('http://api.openweathermap.org/data/2.5/weather?q=' + city + '&APPID=7e51a05cec93ac75b075312cdbc06167', function (err, data, body) {
         if (err) console.log(err);
         let weather = JSON.parse(data.body);
         message.body(`${weather.name} is experiencing ${weather.weather[0].description} with a temperature of ${Math.floor((1.8 * (weather.main.temp - 273.15) + 32) * 10) / 10}°F. Wind speed is ${weather.wind.speed} m/s.`);
         res.writeHead(200, {'Content-Type': 'text/xml'});
         res.end(message.toString());
      });
   } else if (words[0] == 'javascript') {
      let script = sandcastle.createScript(`
      exports.main = function () {
         exit(${req.body.Body.substring(10)})
      }`);
      script.on('exit', function (err, output) {
         if (err) {
            message.body(err);
            res.writeHead(200, {'Content-Type': 'text/xml'});
            res.end(message.toString());
         } else {
            message.body(output);
            res.writeHead(200, {'Content-Type': 'text/xml'});
            res.end(message.toString());
         }
      });
      script.run();
   } else if ((words.indexOf('word') >= 0 || words.indexOf('words')) && words.indexOf('random') >= 0) {
      request.get('http://api.wordnik.com/v4/words.json/randomWord?api_key=23e82ba611d150c37814f63a4380d19cd44937d7b9ad3e439', function (err, data, body) {
         message.body(`${JSON.parse(data.body).word} is a pretty random word.`);
         res.writeHead(200, {'Content-Type': 'text/xml'});
         res.end(message.toString());
      });
   } else if (words.indexOf('define') >= 0) {
      let index = words.indexOf('define') + 1;
      if (index >= words.length) return;
      request.get(`http://api.wordnik.com/v4/word.json/${words[index]}/definitions?limit=1&includeRelated=false&sourceDictionaries=all&useCanonical=true&includeTags=false&api_key=23e82ba611d150c37814f63a4380d19cd44937d7b9ad3e439`, function (err, data, body) {
         data = JSON.parse(data.body)
         message.body(`${words[index]} (${data[0].partOfSpeech}) - ${data[0].text}\n\n${data[0].attributionText}`);
         res.writeHead(200, {'Content-Type': 'text/xml'});
         res.end(message.toString());
      });
   } else if (words.indexOf('number') >= 0) {
      let num = 0;
      for (let i = 0; i < words.length; ++i) {
         if (!isNaN(parseInt(words[i]))) num = parseInt(words[i]);
      }
      request.get(`http://numbersapi.com/${num}/`, function (err, data, body) {
         message.body(body);
         res.writeHead(200, {'Content-Type': 'text/xml'});
         res.end(message.toString());
      });
   } else if (words.indexOf('yodify') == 0) {
      request.get(`https://api.funtranslations.com/translate/yoda.json?text=${text.substring(6)}`, function  (err, data, body) {
         message.body(body.translated);
         res.writeHead(200, {'Content-Type': 'text/xml'});
         res.end(message.toString());
      });
   }
});

app.listen(port, function () {
   console.log(`App listening on port ${port}`);
});
