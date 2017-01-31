const Base64 = require('js-base64').Base64;

const MARKER = "BOTAN_";
const MARKER_BASE64 = "BOTAN_BASE64_";

for (let name in process.env) {
  if (process.env.hasOwnProperty(name)) {
    if (name.startsWith(MARKER_BASE64)) {
      exports[name.substr(MARKER_BASE64.length)] = Base64.decode(process.env[name]);
    } else if (name.startsWith(MARKER)) {
      exports[name.substr(MARKER.length)] = process.env[name];
    }
  }
}