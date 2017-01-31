const ping = require('./ping');
const env = require('./env');
const request = require('request');

const website = require('./website');
website.start();

const botan = require('./botan');
botan.start();

// Ping all target mentioned in the comma sparated url PING_TARGET
const TARGET = env.PING.split(',');
for (let i = 0; i < TARGET.length; i++) {
  ping(TARGET[i]);
}
