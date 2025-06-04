const express = require('express');
const routerBot = require('./routes/routerBot');
const cron = require('node-cron');
const LiveNotif = require('./controller/liveNotif');
const IDNLiveNotif = require('./controller/idnLives');
const config = require('./utils/config');
const logger = require('./utils/logger');

const app = express();
const port = config.server.port;

app.use(express.json());
app.use('/', routerBot);

// Inisialisasi cron job
let cronJob = cron.schedule("*/30 * * * * *", async () => {
  try {
    // Cek Showroom
    const roomLives = await LiveNotif.getMemberLiveData();
    await LiveNotif.getLiveInfo(roomLives);
    
    // Cek IDN
    const idnLives = await IDNLiveNotif.getIDNLives();
    await IDNLiveNotif.getLiveInfo(idnLives);
    
    logger.cron();
  } catch (error) {
    logger.error(`Cron job error: ${error.message}`);
  }
});

app.listen(port, () => {
  logger.info(`Server berjalan di port ${port}`);
}); 