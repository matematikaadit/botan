const moment = require('moment');
const env = require('./env');

const tz = env.TIMEZONE;

function format(time) {
  const mtime = moment(time).utcOffset(tz);
  const ftime = mtime.format('YYYY-MM-DD HH:mm:ss Z');
  return ftime;
}

exports.format = format;