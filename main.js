const ping = require('./ping');
const env = require('./env');
const request = require('request');
const fs = require('fs');

const gist = 'https://gist.githubusercontent.com/matematikaadit/19a16a452496334cb823893aaf620d08/raw/3cfc4770c57156219e4ace7e0a5c9df15bcc5966/botan.db';
request(gist).pipe(fs.createWriteStream('.data/botan.db'));


const website = require('./website');
website.start();

const botan = require('./botan');
botan.start();

// Ping all target mentioned in the comma sparated url PING_TARGET
const TARGET = env.PING.split(',');
for (let i = 0; i < TARGET.length; i++) {
  ping(TARGET[i]);
}