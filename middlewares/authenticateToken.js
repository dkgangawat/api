const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
  // const token = req.headers.authorization.split(' ')[1];
  if (req.path === '/login' || req.path === '/registration' || req.path ==='/payment/redirect' || req.path ==='/payment/callback' || req.path ==='/refund/callback') {
    return next();
  }
  // const token = req.cookies.user;
  const authHeader = req.headers.authorization
  console.log(authHeader)
  if (!authHeader) {
    return res.status(401).json({error: 'Unauthorized'});
  }
  const [bearer, token] = authHeader.split(" ");
  try {
    if (bearer !== 'Bearer') {
      return res.status(401).json({error: 'Unauthorized'});
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userId = decodedToken.userId; 
    next();
  } catch (error) {
    console.error('Error authenticating token:', error);
    res.status(401).json({error: 'Invalid token'});
  }
};

module.exports = {authenticateToken};
