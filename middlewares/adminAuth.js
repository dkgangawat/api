const jwt = require('jsonwebtoken');
const Admin = require('../models/adminSchema');
const config = require('../config/config');
require('dotenv').config();

const adminAuth = async (req, res, next) => {
    if (req.path === '/login' || req.path === '/login/register') {
      return next();
    }
  
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }
  
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token format' });
    }
  
    try {
      console.log('Token:', token);
      console.log('JWT_SECRET_KEY:', process.env.JWT_SECRET_KEY)
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY ) ;
      const admin = await Admin.findOne({ _id: decodedToken._id });
      console.log(decodedToken)
      if (!admin || admin.role !== decodedToken.role) {
        return res.status(401).json({ error: 'Unauthorized: Invalid credentials' });
      }
  
      req.userId = decodedToken._id;
      next();
    } catch (error) {
      console.error('Error authenticating token:', error);
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  };

module.exports = {adminAuth};
