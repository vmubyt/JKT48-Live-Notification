const moment = require('moment-timezone');

function getTimes(timestamp, isUnix = false) {
  if (isUnix) {
    return moment.unix(timestamp).tz('Asia/Jakarta').format('dddd, DD MMMM HH:mm');
  }
  return moment(timestamp).tz('Asia/Jakarta').format('dddd, DD MMMM HH:mm');
}

module.exports = getTimes; 