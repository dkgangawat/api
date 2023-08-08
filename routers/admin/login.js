const express = require('express');
const Admin = require('../../models/adminSchema');
const router = new express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { generateToken } = require('../../helper/generateToken');
const config = require('../../config/config');

// router.post('/register', async (req, res) => {
//     const { email, password } = req.body;
  
//     try {
//       // Check if admin with the same email already exists
//       const existingAdmin = await Admin.findOne({ email });
//       if (existingAdmin) {
//         return res.status(400).json({ error: 'Admin with this email already exists' });
//       }
  
//       // Hash the password
//       const hashedPassword = await bcrypt.hash(password, 10);
  
//       // Create a new admin
//       const admin = new Admin({
//         email,
//         password: hashedPassword,
//       });
  
//       // Save the admin to the database
//       await admin.save();
  
//       res.status(201).json({ message: 'Admin registered successfully', admin });
//     } catch (error) {
//       console.error('Error during admin registration:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   });
  
  
router.post('/', async (req, res) => {
    const { email, password } = req.body;
    try {
      const admin = await Admin.findOne({ email });
  
      if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
      }
  
      const isPasswordMatch = await bcrypt.compare(password, admin.password);
  
      if (!isPasswordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      const payload = {
        _id: admin._id,
        email: admin.email,
        role: admin.role,
      };
      const token = jwt.sign(payload, config.JWT_SECRET_KEY);
      res.cookie('admin', token);
      res.json({ message: 'Login successful', admin, token });
    } catch (error) {
      console.error('Error during admin login:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

  module.exports = router;