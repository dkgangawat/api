const mongoose = require("mongoose");

const payoutSchema = new mongoose.Schema({
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  refund: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Refund",
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
  },
  transporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transporter",
  },
  sellerPayout:{
    type:Number
  },
  transporterPayout: {
    type: Number,
  },
  sellerPayoutTxnID: {
    type: String,
  },
  transporterPayoutTxnID: {
    type: String,
  },
  disbursalStatus: {
    type: String,
    enum: ["ICICI PENDING", "ICICI COMPLETED", "ICICI FAILED"],
  },
});

const Payout = mongoose.model("Payout", payoutSchema);

module.exports = Payout;
