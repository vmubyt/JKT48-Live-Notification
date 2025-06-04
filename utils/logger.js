const { bgCyanBright, redBright, green } = require("colorette");
const moment = require('moment-timezone');

const logger = {
  info: (message) => {
    console.log(green(`[INFO] ${message}`));
  },
  error: (message) => {
    console.error(redBright(`[ERROR] ${message}`));
  },
  cron: () => {
    const now = moment().tz('Asia/Jakarta').format('dddd, DD MMMM HH:mm:ss');
    console.log(bgCyanBright(`[CRON] Live Job Running at ${now}`));
  }
};

module.exports = logger; 