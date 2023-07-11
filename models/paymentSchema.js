const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  agrijodTxnID: {
    type: String
  },
  originalTxnID: String,
  buyerID: {
    type: String
  },
  amount: {
    type: Number
  },
  mobileNumber: {
    type: String
  },
  paymentInstrument: {
    type:Object },
  txnID: {
    type: String
  },
  txnState: {
    type: String
  },
  orderID: {
    type: String
  },
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
