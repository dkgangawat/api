const express = require('express');

const Buyer = require('../models/buyerSchema');
const Item = require('../models/ItemListing');
const bcrypt = require('bcrypt');
const router = new express.Router();
const {generateToken} = require('../helper/generateToken');
const Order = require('../models/orderSchema');
const Refund = require('../models/refundSchema');


router.post('/registration', async (req, res) => {
  try {
    const {phone, email, password, state} = req.body;
    const buyer = new Buyer({
      phone,
      email,
      password,
      state,
    });

    const createdUser = await buyer.save();
    const token = generateToken(createdUser.b_id);
    res.cookie('user', token);
    res.status(201).json({message: 'Step 1: Registration completed successfully as a Buyer', b_id: createdUser.b_id});
  } catch (error) {
    console.error('Error creating Buyer', error);
    res.status(500).json({error: 'Failed to create Buyer'});
  }
});

// Update a Buyer - Step 2: Additional Details
router.put('/details', async (req, res) => {
  try {
    const bId = req.userId;
    const updatedFields = req.body;
    // const { fullName, dateOfBirth, currentAddress, establishmentYear, billingAddress } = req.body;
    const buyer = await Buyer.findOne({b_id: bId});

    if (!buyer) {
      return res.status(404).json({error: 'buyer not found'});
    }

    for (const field in updatedFields) {
      if (field in buyer) {
        buyer[field] = updatedFields[field];
      } else {
        throw new Error(` invalid field, ${field} , accepted fields are fullName, dateOfBirth, currentAddress, establishmentYear, billingAddress  `);
      }
    }

    await buyer.save();

    res.status(200).json({message: 'Step 2: Additional details completed successfully as a buyer'});
  } catch (error) {
    console.error('Error updating buyer', error);
    res.status(500).json({error: `Failed to update buyer, ${error.message}`});
  }
});

// Get a buyer by ID for admin use
router.get('/specific', async (req, res) => {
  try {
    const bId = req.userId;

    const buyer = await Buyer.findOne({b_id: bId});

    if (!buyer) {
      return res.status(404).json({error: 'buyer not found'});
    }

    res.status(200).json(buyer);
  } catch (error) {
    console.error('Error retrieving buyer', error);
    res.status(500).json({error: 'Failed to retrieve buyer'});
  }
});

// login buyer
router.post('/login', async (req, res) => {
  const {emailOrPhone, password} = req.body;

  try {
    const buyer = await Buyer.findOne({
      $or: [{email: emailOrPhone}, {phone: emailOrPhone}],
    });

    if (!buyer) {
      return res.status(404).json({error: 'buyer not found'});
    }

    // Compare the password with the hashed password
    const isPasswordMatch = await bcrypt.compare(password, buyer.password);

    if (!isPasswordMatch) {
      return res.status(401).json({error: 'Invalid password'});
    }

    const token = generateToken(buyer.b_id);
    res.cookie('user', token);
    res.json({message: 'Login successful', buyer, token});
  } catch (error) {
    console.error('Error during buyer login:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});


// Buyer browsing items
router.get('/items', async (req, res) => {
  try {
    const currentDate = new Date();
    const items = await Item.find({
      $or: [
        {schedulePublishDate: {$lte: currentDate}},
        {schedulePublishDate: {$exists: false}},
        {schedulePublishDate: ''},
      ],
      totalStock: {$gt: 0},
      isDraft: false,
    }).select('-pickupAddresses');
    res.json(items);
  } catch (error) {
    res.status(500).json({message: 'Failed to fetch items.'});
  }
});

router.get('/orders/:status', async (req, res) => {
  const {status} = req.params;
  const {userId} = req;
  try {
    let orders;
    if (status === 'pending') {
       orders = await Order.find({buyerID: userId, status: {$ne: 'fulfilled'}, $or: [{paymentStatus: 'completed'}, {paymentStatus: 'initiated'}]}).populate('itemRef');
     
    } else if (status === 'fulfilled') {
      orders = await Order.find({buyerID: userId, status: 'fulfilled', paymentStatus: 'completed'}).populate('itemRef');
    } else {
      return res.status(400).json({message: 'Invalid status'});
    }
    const orderDetails = orders.map((order)=>{
      const {orderID, itemRef, orderSize, totalCost, paymentStatus, status, wantShipping} = order
      let pickupPoint  ="Exact Location will be shared soon";
      if(wantShipping ===true){
        pickupPoint = 'No worries!! Agrijod is your shipping partner'
      }
      if(paymentStatus === 'initiated' && wantShipping === false ){
        pickupPoint = 'Exact Location will be shared soon'
      }
      if(wantShipping === false && paymentStatus === 'completed' && sellerVerified ==='pending'){
        pickupPoint = itemRef.pickupAddresses
      }
      if(status === "Item Canceled"){
        pickupPoint = null
      }
      return({
        orderID, itemName:itemRef?.itemName, quantity:orderSize,wantShipping, payment:totalCost, paymentStatus,pickupPoint, status
      })
    })
    res.status(200).json(orderDetails)
  } catch (error) {
    console.error('Error retrieving orders:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

router.post('/order/confirm-received/:orderId', async (req, res) => {
  const {orderId} = req.params;
  const {userId} = req;

  try {
    const {imageLink1, imageLink2} = req.body;
    const order = await Order.findOne({orderID: orderId});
    if (!order || userId !== order.buyerID) {
      return res.status(404).json({error: 'Order not found'});
    }
    order.fulfilled.push(imageLink1, imageLink2);
    order.status = 'fulfilled';
    await order.save();

    res.json({message: 'Order received and fulfilled successfully'});
  } catch (error) {
    console.error('Error: ', error);
    res.status(500).json({error: 'Internal server error'});
  }
});
router.get('/refunds', async (req, res) => {
  try {
    const userId = req.userId;
    const refunds = await Refund.find({buyerID: userId}).populate('order').populate({path:"order",populate: {
      path: 'itemRef',
      model: 'Item'
    }})
    const orders = refunds.map((refund)=>{
      const {orderID, itemRef, paymentStatus, status} = refund.order
      return({
        orderID,
        itemName:itemRef?.itemName,
        refundAmount:refund.amountToBeRefunded,
        paymentStatus,
        orderStatus:status,
        transactionID:refund.transactionID,
        refundStatus: refund.refundStatus
      })
    })
    res.json(orders);
  } catch (error) {
    console.error('Error: ', error);
    res.status(500).json({error: 'Internal server error'});
  }
});


module.exports = router;
