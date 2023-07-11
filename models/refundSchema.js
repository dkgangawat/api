const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
    refundID: {
        type: String,
        required: true},
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  buyerID:{
    type: String,
    required: true
  },
  productRefundAmount:{
    type: Number,
    required: true
  },
  shippingRefundAmount:{
    type: Number,
    required: true
  },
  amountToBeRefunded: {
    type: Number,
    required: true
  },
  transactionID: String,
  refundStatus: {
    type: String,
    enum: [null,'initiated', 'reversed', 'pending','processing', 'completed', 'failed'],
    default: null
  },

}, {
  timestamps: true
});

const Refund = mongoose.model('Refund', refundSchema);

module.exports = Refund;
