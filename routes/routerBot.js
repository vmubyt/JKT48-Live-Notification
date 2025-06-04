const express = require('express');
const LiveNotif = require('../controller/liveNotif');
const IDNLiveNotif = require('../controller/idnLives');
const router = express.Router();

// Endpoint untuk notifikasi live
router.get('/notification', LiveNotif.getLiveNotification);
router.get('/idn-notification', IDNLiveNotif.sendDiscordNotif);

module.exports = router; 