const express = require('express');
const Order = require('../../models/orderSchema');
const router = new express.Router()

router.get('/', async (req, res) => {
    try {
      const refundOrders = await Order.find({
        $or: [
          { status: 'Item Canceled' },
          { status: 'fulfilled'}
        ]
      }).populate('itemRef').populate('buyerRef')
  
      const refundDetails = refundOrders.map(order => ({
        orderID: order.orderID,
        itemID: order.itemRef?.itemID,
        itemName: order.itemRef?.itemName,
        orderSize: order.orderSize,
        productCost: order.productCost,
        shippingCost: order.shippingCost,
        totalCost: order.totalCost,
        buyerID: order.buyerID,
        buyerAccountNumber: order.buyerRef?.bankDetails?.accountNumber,
        buyerIFSC: order.buyerRef?.bankDetails?.ifscCode,
        amountToBeRefunded: order.status === 'Item Canceled' ? order.totalCost : 0,
        transactionID: order.transactionID,
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
        refundStatus: order.refundStatus
      }));
  
      res.status(200).json(refundDetails);
    } catch (error) {
      console.error('Error fetching refund orders:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  router.put('/pay/:orderID', async (req, res) => {
    try {
      const { orderID } = req.params;
      const order = await Order.findOne({ orderID });
      const  amountToBeRefunded= order.status === 'Item Canceled' ? order.totalCost : 0;
      // Perform the refund payment logic here
  
      // Update the refund status
      order.refundStatus = 'initiated';
      const updatedOrder = await order.save();
  
      res.status(200).json(updatedOrder);
    } catch (error) {
      console.error('Error initiating refund payment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

module.exports = router;
  