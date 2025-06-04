require('dotenv').config();

module.exports = {
  mongodb: {
    url: process.env.MONGO_DB || 'mongodb://localhost:27017',
    dbName: 'showroom'
  },
  discord: {
    showroom: {
      id: process.env.LIVE_SHOWROOM_ID,
      token: process.env.LIVE_SHOWROOM_TOKEN
    },
    idn: {
      id: process.env.IDN_LIVE_NOTIF_CHANNEL_ID,
      token: process.env.IDN_LIVE_NOTIF_CHANNEL_TOKEN
    }
  },
  server: {
    port: process.env.PORT || 3000
  }
}; 