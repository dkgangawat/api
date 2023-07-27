const mongoose = require('mongoose');
const {generateOrderID} = require('../helper/generateUniqueId');

const orderSchema = new mongoose.Schema({
  orderID: {
    type: String,
    unique: true,
  },
  buyerID: {
    type: String,
    required: true,
  },
  buyerRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: true,
  },
  buyerState: {
    type: String,
    required: true,
  },
  sellerID: {
    type: String,
    required: true,
  },
  transporter: {
    type: {
      transporterId: String,
      vehicleId: String,
      numberOfVehicle: Number,
    },
    default: null,
  },

  itemID: {
    type: String,
    required: true,
  },
  itemRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  orderSize: {
    type: Number,
    required: true,
    validate: {
      validator: function(value) {
        return Number.isInteger(value) && value > 0;
      },
      message: 'The field must be a natural number (positive integer).',
    },
  },
  sellerVerified: {
    type: String,
    default: 'pending',
    enum: ['pending', 'accept', 'reject'],
  },
  paymentStatus: {
    type: String,
    enum: ['null', 'initiated', 'completed', 'failed'],
    default: 'null',
  },
  status: {
    type: String,
    default: null,
  },
  wantShipping: {
    type: Boolean,
  },
  dropoffLocation: {
    type: String,

  },
  productCost: {
    type: Number,
    required: true,
    validate: {
      validator: function(value) {
        return value >= 0;
      },
      message: 'productCost field must be a positive',
    },
  },
  shippingCost: {
    type: Number,
    default: 0,
    validate: {
      validator: function(value) {
        return value >= 0;
      },
      message: 'shippingCost field must be a positive',
    },
  },
  totalCost: {
    type: Number,
    required: true,
    validate: {
      validator: function(value) {
        return value >= 0;
      },
      message: 'totalCost field must be a positive',
    },
  },
  invoice: {
    type: String,
  },
  fulfilled: [String],
  partialRefund: {
    type: Boolean,
    default: false,
  },
  refundStatus: {
    type: String,
    enum: [null, 'initiated', 'reversed', 'pending', 'processing', 'completed', 'failed'],
    default: null,
  },


}, {timestamps: true});
// orderSchema.pre('save', async function(next) {
//     if (this.isNew) {
//         console.log(this.buyerState)
//         this.orderID = generateOrderID(this.buyerState);
//     }
//     next();
// });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
