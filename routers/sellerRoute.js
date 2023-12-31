const express = require('express');

const Seller = require('../models/seller');
const bcrypt = require('bcrypt');
const router = new express.Router();
const item = require('../models/ItemListing');
const Order = require('../models/orderSchema');
const {generateToken} = require('../helper/generateToken');
const {updateOrderStatus} = require('../helper/updateOrderStatus');
const {updateTotalStocks} = require('../helper/updateTotalStocks');
const {updateRefundStatus} = require('../helper/updateRefundStatus');
const {addToRefundTable} = require('../helper/addToRefundTable');
const {updateAvailableToday} = require('../helper/updateAvailableToday');
const Vehicle = require('../models/VehicleSchema');


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

    const token = generateToken(createdUser.s_id);
    res.cookie('user', token);
    // res.redirect(`/seller-details/${createdUser._id}`)
    res.status(201).json({message: 'Step 1: Registration completed successfully', s_id: createdUser.s_id});
    // res.status(302).send(`<html><body><p> Redirecting to <a href=${`/seller-details/${}`}></a> </p></body></html>`)
  } catch (error) {
    console.error('Error creating seller', error);
    res.status(500).json({error: 'Failed to create seller', message: error.message});
  }
});

// Update a seller - Step 2: Additional Details
router.put('/details', async (req, res) => {
  try {
    const sId = req.userId;
    console.log(sId);
    const updatedFields = req.body;
    // const { fullName, dateOfBirth, currentAddress, addressProof, bankDetails, escrowTermsAccepted, sellerVerificationDocuments, highestQualification, draft } = req.body;
    const seller = await Seller.findOne({s_id: sId});
    if (!seller) {
      return res.status(404).json({error: 'Seller not found'});
    }

    for (const field in updatedFields) {
      if (field in seller) {
        seller[field] = updatedFields[field];
      } else {
        throw new Error(` invalid field, ${field} , accepted fields are fullName, dateOfBirth, currentAddress, addressProof, bankDetails, escrowTermsAccepted, sellerVerificationDocuments, highestQualification, draft  `);
      }
    }

    await seller.save();

    res.status(200).json({message: 'Step 2: Additional details completed successfully'});
  } catch (error) {
    console.error('Error updating seller', error);
    res.status(500).json({error: `Failed to update seller, ${error.message}`});
  }
});

// Get a seller by ID for admin use
router.get('/specific', async (req, res) => {
  try {
    const sId = req.userId;
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
router.get('/item-management', async (req, res) => {
  const {userId} = req;
  try {
    const items = await item.find({seller: userId, isDraft: false});
    res.json(items);
  } catch (error) {
    console.error('Error retrieving items:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

router.get('/orders', async (req, res) => {
  const {userId} = req;
  try {
    const orders = await Order.find({sellerID: userId, status: {$ne: null}, paymentStatus: 'completed'}).populate('itemRef');
    res.json(orders);
  } catch (error) {
    console.error('Error retrieving orders:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

router.get('/orders/:status', async (req, res) => {
  const {status} = req.params;
  const {userId} = req;
  try {
    if (status === 'pending') {
      const orders = await Order.find({sellerID: userId, $and: [{status: {$ne: null}}, {status: {$ne: 'fulfilled'}}], paymentStatus: 'completed'}).populate('itemRef');
      return res.json(orders);
    } else if (status === 'fulfilled') {
      const orders = await Order.find({sellerID: userId, status: 'fulfilled', paymentStatus: 'completed'}).populate('itemRef');
      res.json(orders);
    } else {
      return res.status(400).json({message: 'Invalid status'});
    }
  } catch (error) {
    console.error('Error retrieving orders:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});
router.get('/notifications', async (req, res) => {
  const userId = req.userId;

  try {
    const orders = await Order.find({sellerID: userId, sellerVerified: 'pending', paymentStatus: 'completed'}).populate('itemRef');
    const notificationsData =orders.map((order)=>{
      return {
        orderID:order.orderID,
        itemName:order?.itemRef?.itemName,
        totalCost:order.totalCost,
        orderSize: order.orderSize,
        pickupAddresses:order.itemRef?.pickupAddresses
      }
    })
    res.json(notificationsData);
  } catch (error) {
    console.error('Error: ', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

router.put('/orders/:orderId', async (req, res) => {
  const {orderId} = req.params;
  const {status} = req.body;

  try {
    const order = await Order.findOne({orderID: orderId});
    const sellerId = req.userId;
    if (order.sellerID !== sellerId) {
      return res.status(401).json({message: 'Unauthorized'});
    }
    if (status === 'accept') {
      const responce = await updateOrderStatus(orderId, 'Ready for pickup', 'accept');
      if (!responce) {
        return res.status(200).json({message: `order already ${status}`});
      }
      if (!responce.success) {
        return res.status(404).json({message: 'order not found'});
      }
    } else {
      const responce = await updateOrderStatus(orderId, 'Item Canceled', 'reject');
      await addToRefundTable(orderId);
      const refundStatus = await updateRefundStatus(orderId, 'processing');
      if (order.wantShipping === true && order.transporter?.vehicleId) {
        const vehicle= await Vehicle.findOne({vehicleId: order.transporter?.vehicleId, isActive: true});
        await updateAvailableToday(order.transporter?.vehicleId, vehicle.availableToday + order.transporter?.numberOfVehicle );
      }
      if (!responce || !refundStatus) {
        return res.status(404).json({message: 'order not found'});
      }
    }
        (status === 'accept') ? await updateTotalStocks(orderId): '';

        res.status(200).json({message: `Order ${status}`});
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

router.get('/refunds', async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await Order.find({sellerID: userId, sellerVerified: 'reject', paymentStatus: 'completed'}).populate('itemRef');
    res.json(orders);
  } catch (error) {
    console.error('Error: ', error);
    res.status(500).json({error: 'Internal server error'});
  }
});


module.exports = router;
