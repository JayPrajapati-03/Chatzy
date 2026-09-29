const dotenv = require('dotenv');

dotenv.config();

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chatzy',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || '*'
};

if (!process.env.MONGODB_URI && process.env.NODE_ENV === 'production') {
  console.warn('WARNING: MONGODB_URI is not explicitly defined. Using default fallback.');
}

module.exports = env;
