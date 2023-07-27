const express = require('express');
const Buyer = require('../../models/buyerSchema');
const Order = require('../../models/orderSchema');
const Payment = require('../../models/paymentSchema');
const router = new express.Router();

router.get('/', async (req, res) => {
  try {
    console.log("rr")
    const buyers = await Buyer.find({}, 'b_id fullName ');
    res.status(200).json(buyers);
  } catch (error) {
    console.error('Error fetching buyers:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

router.get('/orders/:buyerID/:status', async (req, res) => {
  try {
    const {buyerID, status} = req.params;
    let orders;
    if (status === 'fulfilled') {
      orders = await Order.find({buyerID, status: 'fulfilled'}).populate('itemRef');
    } else {
      orders = await Order.find({buyerID , status:{$ne:"fulfilled"}}).populate('itemRef');
    }
    const payments = await Payment.find({buyerID: buyerID});
    const orderDetails = orders.map((order) => {
      const payment = payments.filter((payment) => payment.orderID === order.orderID);
      let extraDetails = {};

      if (status === 'fulfilled') {
        extraDetails = {
          orderRecivedImages: order.fulfilled,
        };
      } else {
        extraDetails = {
          dateOfTransaction: order.dateOfTransaction,
          transactionID: payment[0]?.agrijodTxnID,
          itemPrice: order.itemRef.price,
        };
      }
      return {
        orderID: order.orderID,
        extraDetails,
        status: order.status,
        itemName: order.itemRef.itemName,
        payment: order.totalCost,
        quantity: order.orderSize,
        pickupPoint: order.itemRef.pickupAddresses,
        PaymentStatus: payment[0]?.txnState,
      };
    });

    res.status(200).json(orderDetails);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({error: `'Internal server error', ${error.message}`});
  }
});

router.get('/:buyerId', async (req, res) => {
  // get specific buyer
  const {buyerId} = req.params;
  try {
    const buyer = await Buyer.findOne({b_id: buyerId});
    if (!buyer) {
      return res.status(404).json({error: 'buyer not found'});
    }
    res.status(200).json(buyer);
  } catch (error) {
    console.error('Error retrieving buyer items:', error);
    res.status(500).json({error: `'Internal server error', ${error.message}`});
  }
});
router.put('/:buyerId', async (req, res) => {
  const {buyerId} = req.params;
  const updatedFields = req.body;
  try {
    const buyer = await Buyer.findOneAndUpdate({b_id: buyerId}, updatedFields, {new: true});
    res.json(buyer);
  } catch (error) {
    console.error('Error updating buyer details:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

module.exports = router;
