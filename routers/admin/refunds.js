const express = require('express');
const Order = require('../../models/orderSchema');
const Refund = require('../../models/refundSchema');
const config = require('../../config/config');
const Payment = require('../../models/paymentSchema');
const { encodeRequest, generateSignature, decodeResponse } = require('../../helper/pay');
const { default: axios } = require('axios');
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
        productRefundAmount: refund.productRefundAmount,
        shippingRefundAmount: refund.shippingRefundAmount,
        buyerID: order.buyerID,
        buyerAccountNumber: order.buyerRef?.bankDetails?.accountNumber,
        buyerIFSC: order.buyerRef?.bankDetails?.ifscCode,
        amountToBeRefunded:refund.amountToBeRefunded,
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
      //check
      const refund = await Refund.findOne({ refundID: orderID })
      if (!refund) {
        return res.status(404).json({ message: 'Refund not found' });
      }
      refund.productRefundAmount = productRefundAmount,
      refund.shippingRefundAmount = shippingRefundAmount,
      refund.amountToBeRefunded = productRefundAmount+shippingRefundAmount
      const updatedRefund = await refund.save()

      const order = await Order.findOne({orderID})

      order.productCost = order.productCost - updatedRefund.productRefundAmount
      order.shippingCost = order.shippingCost - updatedRefund.shippingRefundAmount
      order.totalCost = order.totalCost - updatedRefund.amountToBeRefunded

      const updatedOrder = await order.save()
      
      return res.status(200).json({updatedOrder , updatedRefund});
    } catch (error) {
      console.error('Error updating refund:', error);
      res.status(500).json({ error: 'Internal server error',message:error.message });
    }
  });
  
  
  router.put('/pay/:orderID', async (req, res) => {
    try {
      const { orderID } = req.params;
      const refund = await Refund.findOne({ refundID:orderID });
      const  amountToBeRefunded= refund.amountToBeRefunded
      const payment = await Payment.findOne({orderID:orderID})
      if (!payment || !refund) {
        return res.status(404).json({ message: 'order either not avilable in refund or in payment table' });
      }
      //  refund payment logic
      const payload ={
        "merchantId": config.MERCHANT_ID,
        "merchantUserId": payment.buyerID,
        "originalTransactionId": payment.txnID,
        "merchantTransactionId": payment.agrijodTxnID,
        "amount": amountToBeRefunded,
        "callbackUrl": `config.AGRIJOD_BASE_URL/refund/callback`
    }
    const base64 = encodeRequest(payload)
    const sign = `${base64}/pg/v1/refund${config.MERCHANT_KEY}`
    const XVerify = generateSignature(sign)+'###'+'1'
    const options = {
      method: 'POST',
      url: `${config.PHONEPE_BASE_URL}/pg/v1/refund`,
      headers: {
        accept: 'application/json',
        'Content-type': 'application/json',
        'X-VERIFY': XVerify
      },
      data: {request: base64}
    };
    const response = await axios.request(options);
      // Update the refund status
      refund.refundStatus = 'initiated';
      const updatedRefund = await refund.save();
  
      res.status(200).json({updatedRefund,refund:response.data});
    } catch (error) {
      console.error('Error initiating refund payment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

router.post('/refund/callback', async (req,res)=>{
  try {
    console.log(req.body.response)
    const callbackResponse = req.body.response
    const data = decodeResponse(callbackResponse)
    console.log(data)
    // const {originalTransactionId,merchantTransactionId,amount,refundId,refundStatus} = data.data
    // const refund = await Refund.findOne({refundID:originalTransactionId})
    // if(!refund){
    //   return res.status(404).json({ message: 'Refund not found' });
    // }
    // refund.transactionID = refundId
    // refund.refundStatus = refundStatus
    // const updatedRefund = await refund.save()
    res.status(200).json({data})
  } catch (error) {
    console.error('Error updating refund:', error);
    res.status(500).json({ error: 'Internal server error',message:error.message });
  }
})

module.exports = router;
  