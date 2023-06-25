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
    itemID: {
        type: String,
        required: true,
    },
    orderSize: {
        type: Number,
        required: true,
    },
    sellerVarifide: {
        type: Boolean,
        default: "pending",
        enum: ['pending', 'accept', 'reject', 'fullfilled']
    },
    paymentStatus: {
        type: String,
        enum: ['null', 'initiated', 'completed'],
        default: 'null',
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