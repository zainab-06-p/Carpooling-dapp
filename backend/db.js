const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('strictQuery', false);

const ConnectToMongo = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ChatSystem'; // Fallback for local dev
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB successfully');
    setupTTLIndex();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit process on connection failure
  }
};

const setupTTLIndex = () => {
  const collectionName = 'messages';
  const ttlField = 'createdAt';
  const ttlInSeconds = 60 * 60; // 1 hour

  const collection = mongoose.connection.collection(collectionName);
  collection
    .createIndex({ [ttlField]: 1 }, { expireAfterSeconds: ttlInSeconds })
    .then(() => {
      console.log(`TTL index created on collection "${collectionName}" for field "${ttlField}"`);
    })
    .catch((error) => {
      console.error('Error creating TTL index:', error);
    });
};

module.exports = { ConnectToMongo, mongoose };