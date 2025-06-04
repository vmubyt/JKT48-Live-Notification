const { MongoClient } = require("mongodb");
const config = require('./config');
const logger = require('./logger');

const client = new MongoClient(config.mongodb.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function getMongoClient() {
  try {
    if (!client.topology?.isConnected()) {
      await client.connect();
      logger.info('Connected to MongoDB');
    }
    return client;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
}

module.exports = { getMongoClient }; 