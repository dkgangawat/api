require('dotenv').config();

const config = {
  PORT: process.env.PORT || 8000,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  MONGO_URI: process.env.MONGO_URI,
  GOOGLE_MAP_KEY: process.env.GOOGLE_MAP_KEY,
  MERCHANT_ID: process.env.MERCHANT_ID || 'MERCHANTUAT',
  MERCHANT_KEY: process.env.MERCHANT_KEY||'099eb0cd-02cf-4e2a-8aca-3e6c6aff0399',
  PHONEPE_BASE_URL: process.env.PHONEPE_BASE_URL ||'https://api-preprod.phonepe.com/apis/pg-sandbox',
  PHONEPE_CALLBACK_URL: process.env.PHONEPE_CALLBACK_URL,
  AGRIJOD_BASE_URL: process.env.AGRIJOD_BASE_URL
};  

module.exports = config;
