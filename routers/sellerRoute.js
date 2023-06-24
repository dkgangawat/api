const express = require('express');

const Seller = require('../models/seller');
const bcrypt = require('bcrypt');
const router = new express.Router();
const jwt = require('jsonwebtoken');
const {JWT_SECRET_KEY} = require('../config/config');
const {authenticateToken} = require('../middlewares/authenticateToken');
const item = require('../models/ItemListing');
const Order = require('../models/orderSchema');
const {generateToken} = require('../helper/generateToken');


router.post('/registration', async (req, res) => {
  try {
    const {phone, email, password, state} = req.body;
    const seller = new Seller({
      phone,
      email,
      password,
      state,
      draft: true,
    });

    const createdUser = await seller.save();
    // res.redirect(`/seller-details/${createdUser._id}`)
    res.status(201).json({message: 'Step 1: Registration completed successfully', s_id: createdUser.s_id});
    // res.status(302).send(`<html><body><p> Redirecting to <a href=${`/seller-details/${}`}></a> </p></body></html>`)
  } catch (error) {
    console.error('Error creating seller', error);
    res.status(500).json({error: 'Failed to create seller'});
  }
});

// Update a seller - Step 2: Additional Details
router.put('/details/:sId', async (req, res) => {
  try {
    const {sId} = req.params;
    const {fullName, dateOfBirth, currentAddress, addressProof, bankDetails, escrowTermsAccepted, sellerVerificationDocuments, highestQualification, draft} = req.body;
    const seller = await Seller.findOne({s_id: sId});

    if (!seller) {
      return res.status(404).json({error: 'Seller not found'});
    }

    seller.fullName = fullName;
    seller.dateOfBirth = dateOfBirth;
    seller.currentAddress = currentAddress;
    seller.addressProof = addressProof;
    seller.bankDetails = bankDetails;
    seller.escrowTermsAccepted = escrowTermsAccepted;
    seller.sellerVerificationDocuments = sellerVerificationDocuments;
    seller.highestQualification = highestQualification;
    seller.draft = draft;

    await seller.save();

    res.status(200).json({message: 'Step 2: Additional details completed successfully'});
  } catch (error) {
    console.error('Error updating seller', error);
    res.status(500).json({error: 'Failed to update seller'});
  }
});

// Get a seller by ID for admin use
router.get('/specific/:sId', async (req, res) => {
  try {
    const {sId} = req.params;

    const seller = await Seller.findOne({s_id: sId});

    if (!seller) {
      return res.status(404).json({error: 'Seller not found'});
    }

    res.status(200).json(seller);
  } catch (error) {
    console.error('Error retrieving seller', error);
    res.status(500).json({error: 'Failed to retrieve seller'});
  }
});

// login seller
router.post('/login', async (req, res) => {
  const {emailOrPhone, password} = req.body;

  try {
    const seller = await Seller.findOne({
      $or: [{email: emailOrPhone}, {phone: emailOrPhone}],
    });

    if (!seller) {
      return res.status(404).json({error: 'Seller not found'});
    }

    // Compare the password with the hashed password
    const isPasswordMatch = await bcrypt.compare(password, seller.password);

    if (!isPasswordMatch) {
      return res.status(401).json({error: 'Invalid password'});
    }

    const token = generateToken(seller.s_id);
    res.cookie('user', token);
    res.json({message: 'Login successful', seller, token});
  } catch (error) {
    console.error('Error during seller login:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

// item management
router.get('/item-management', authenticateToken, async (req, res) => {
  const {userId} = req;
  console.log(userId);
  try {
    const items = await item.find({seller: userId});
    res.json(items);
  } catch (error) {
    console.error('Error retrieving items:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

router.get('/orders/:status', authenticateToken, async (req, res) => {
  const {status} = req.params;
  const {userId} = req;

  try {
    let sellerVerifiedStatus;

    if (status === 'pending') {
      sellerVerifiedStatus = 'pending';
    } else if (status === 'accepted') {
      sellerVerifiedStatus = 'accept';
    } else if (status === 'rejected') {
      sellerVerifiedStatus = 'reject';
    } else if (status === 'fulfilled') {
      sellerVerifiedStatus = 'fulfilled';
    } else {
      return res.status(400).json({message: 'Invalid status'});
    }

    const orders = await Order.find({sellerID: userId, sellerVerified: sellerVerifiedStatus, paymentStatus: 'completed'});
    res.json(orders);
  } catch (error) {
    console.error('Error retrieving orders:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

router.put('/orders/:orderId', authenticateToken, async (req, res) => {
  const {orderId} = req.params;
  const {status} = req.body;

  try {
    const order = await Order.findOneAndUpdate({orderID: orderId}, {sellerVerified: status}, {new: true});

    if (!order) {
      return res.status(404).json({message: 'Order not found'});
    }

    res.json({message: 'Order status updated successfully', order});
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});


module.exports = router;
