const express = require('express');
const Payout = require('../../models/payoutSchema');
const router = new express.Router()

router.get('/',async (req,res)=>{
    try{
        const payouts = await Payout.find().populate('payment').populate('order').populate('refund')
          const payoutDetails = payouts.map(payout => {
           const {payment,order,refund,seller,transporter}= payout
          c
           return ({
            agrijodTxnID:payment.agrijodTxnID,
            txnState:payment.txnState,
            txnID:payment.txnID,
            amount:payment.amount,
            orderID: order.orderID,
            refundAmount:refund.amountToBeRefunded,
            productCost :order.productCost,
            shippingCost  :order.shippingCost,
            sellerPayout: order.productCost*0.98,
            transporterPayout: order.shippingCost*0.99,
            orderStatus: order.status,
            actionButton,
            disbursalStatus:payout.disbursalStatus
          })}
          );
      
          res.status(200).json(payoutDetails);
        } catch (error) {
          console.error('Error fetching payout orders:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
})
router.get('/view:payoutID',async (req, res)=>{
    try {
        const {payoutID} = req.params
        const payout = Payout.findById(payoutID)
        const {order,seller,transporter}= payout
        const actionButton={
            sellerID: seller.s_id,
            sellerPayout: order.productCost*0.98,
            sellerAccNo: seller.bankDetails?.accountNumber,
            sellerIFSC: seller.bankDetails?.ifscCode,
            transporterID: transporter?.transporterID,
            transporterPayout: order.shippingCost*0.99,
            transporterAccNo: transporter?.bankDetails?.accountNumber,
            transporterIFSC:   transporter?.bankDetails?.ifscCode,
            sellerPayoutTxnID:payout.sellerPayoutTxnID,
            transporterPayoutTxnID:payout.transporterPayoutTxnID,
           }
           res.status(200).json(actionButton)
    } catch (error) {
        console.error('Error fetching payout orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.put('/update/txnids:payoutID' ,async (req,res)=>{
    try {
        const {payoutID} = req.params
        const {sellerPayoutTxnID,transporterPayoutTxnID} = req.body
        const payout = Payout.findById(payoutID)
        payout.sellerPayoutTxnID = sellerPayoutTxnID
        payout.transporterPayoutTxnID = transporterPayoutTxnID
        const updatedPayout = await payout.save()
        res.status(200).json(updatedPayout)

    } catch (error) {
        console.error('Error fetching payout orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})
router.put('/update/disbursal-status:payoutID' ,async (req,res)=>{
    try {
        const {payoutID} = req.params
        const {disbursalStatus} = req.body
        const payout = Payout.findById(payoutID)
        payout.disbursalStatus = disbursalStatus
        const updatedPayout = await payout.save()
        res.status(200).json(updatedPayout)

    } catch (error) {
        console.error('Error fetching payout orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})
module.exports = router