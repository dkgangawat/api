const mongoose = require('mongoose');
const { generateOrderID } = require('../helper/generateUniqueId');

const orderSchema = new mongoose.Schema({
    orderID: {
        type: String,
        unique: true,
    },
    buyerID: {
        type: String,
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
    transporterID: {
        type: String
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
    },
    sellerVerified: {
        type: String,
        default: "pending",
        enum: ['pending', 'accept', 'reject']
    },
    paymentStatus: {
        type: String,
        enum: ['null', 'initiated', 'completed', 'failed'],
        default: 'null',
    },
    status: {
        type: String,
        default: null
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
    },
    shippingCost: {
        type: Number,
        default: 0,
    },
    totalCost: {
        type: Number,
        required: true,
    },
    invoice: {
        type: String
    },
    fulfilled: [String]


}, { timestamps: true });
orderSchema.pre('save', async function(next) {
    if (this.isNew) {
        console.log(this.buyerState)
        this.orderID = generateOrderID(this.buyerState);
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;