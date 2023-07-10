const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  agrijodTxnID: {
    type: String,
    required: true,
  },
  originalTxnID: String,
  buyerID: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  paymentInstrument: {
    type:Object },
  txnID: {
    type: String,
    required: true,
  },
  txnState: {
    type: String,
    required: true,
  },
  orderID: {
    type: String,
    required: true,
  },
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
