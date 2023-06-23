const jwt = require('jsonwebtoken');
const {JWT_SECRET_KEY} = require('../config/config');

const generateToken = (userId) => {
  return jwt.sign({
    userId,
  }, JWT_SECRET_KEY);
};

module.exports = {generateToken};
