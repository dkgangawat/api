const express = require('express');
const Order = require('../../models/orderSchema');
const Refund = require('../../models/refundSchema');
const router = new express.Router()

router.get('/', async (req, res) => {
    try {
      const refunds = await Refund.find().populate('order').populate({path:"order",populate: {
        path: 'itemRef',
        model: 'Item'
      }}).populate({path:"order",populate: {
        path: 'buyerRef',
        model: 'Buyer'
      }})
  
      const refundDetails = refunds.map(refund => {
       const {order}= refund
       return ({
        orderID: order.orderID,
        itemID: order.itemRef?.itemID,
        itemName: order.itemRef?.itemName,
        orderSize: order.orderSize,
        productRefundAmount:order.status === 'Item Canceled' ? refund.productRefundAmount : 0 ,
        shippingRefundAmount:order.status === 'Item Canceled' ? refund.shippingRefundAmount:0,
        buyerID: order.buyerID,
        buyerAccountNumber: order.buyerRef?.bankDetails?.accountNumber,
        buyerIFSC: order.buyerRef?.bankDetails?.ifscCode,
        amountToBeRefunded: order.status === 'Item Canceled' ? refund.amountToBeRefunded: 0,
        transactionID: refund.transactionID,
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
        refundStatus: refund.refundStatus
      })}
      );
  
      res.status(200).json(refundDetails);
    } catch (error) {
      console.error('Error fetching refund orders:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  router.put('/partial-refund/:orderID', async (req, res) => {
    try {
      const { orderID } = req.params;
      const { productRefundAmount, shippingRefundAmount } = req.body;
      
      const refund = await Refund.findOneAndUpdate(
        { refundID: orderID },
        { productRefundAmount, shippingRefundAmount },
        { new: true }
      )
      if (!refund) {
        return res.status(404).json({ message: 'Refund not found' });
      }
  
      return res.status(200).json(refund);
    } catch (error) {
      console.error('Error updating refund:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  
  router.put('/pay/:orderID', async (req, res) => {
    try {
      const { orderID } = req.params;
      const refund = await Refund.findOne({ refundID:orderID });
      const  amountToBeRefunded= refund.amountToBeRefunded
      // Perform the refund payment logic here
  
      // Update the refund status
      refund.refundStatus = 'initiated';
      const updatedRefund = await refund.save();
  
      res.status(200).json(updatedRefund);
    } catch (error) {
      console.error('Error initiating refund payment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

module.exports = router;
  