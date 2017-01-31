// Ping Timer

const request = require('request');

// send HTTP GET to `url` every `n` seconds (default: 42s)
function ping(url, sec = 42) {
  console.log(`Sending HTTP GET to url: ${url}, every ${sec} seconds`);
  setInterval(sendRequest.bind(null, url), sec * 1000);
}

// send request to url and log the error
function sendRequest(url) {
  request(url, (err) => {
    if (err) {
      console.log(`Request error, ${err}`);
    }
  });
}

module.exports = ping;