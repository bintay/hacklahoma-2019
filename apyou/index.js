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

app.post('/sms', (req, res) => {
   const response = new MessagingResponse();
   const message = response.message();

   const text = req.body.Body.toLowerCase();
   const words = text.split(/\s/g);

   if (words.indexOf('cat') >= 0 || words.indexOf('cats') >= 0) {
      message.body(cats.all[Math.floor(Math.random() * 160)].text);
      request.get('https://aws.random.cat/meow', function (err, data, body) {
         if (err) console.log(err);
         message.media(data.file);
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
      console.log(city);
      request.get('http://api.openweathermap.org/data/2.5/weather?q=' + city + '&APPID=7e51a05cec93ac75b075312cdbc06167', function (err, data, body) {
         if (err) console.log(err);
         let weather = JSON.parse(data.body);
         console.log(weather);
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
         console.log(err, output);
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
   }
});

app.listen(port, function () {
   console.log(`App listening on port ${port}`);
});
