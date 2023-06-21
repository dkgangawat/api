const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    orderID: {
        type: String,
        unique: true,
    },
    buyerID: {
        type: String,
        required: true
    },
    buyerState: {
        type: String,
        required: true,
    },
    sellerID: {
        type: String,
        required: true
    },
    itemID: {
        type: String,
        required: true
    },
    orderSize: {
        type: Number,
        required: true
    },
    sellerVarifide: {
        type: Boolean,
        default: null
    },
    paymentStatus: {
        type: String,
        enum: ['null', 'initiated', 'completed'],
        default: 'null'
    },
    wantShipping: {
        type: Boolean,
    },
    dropoffLocation: {
        type: String
    },
    productCost: {
        type: Number,
        required: true
    },
    shippingCost: {
        type: Number,
        default: 0
    },
    totalCost: {
        type: Number,
        required: true
    },

})
orderSchema.pre("save", async function(next) {
    if (this.isNew) {
        const stateInitials = this.buyerState.toUpperCase().replace(/\s+/g, '').substring(0, 2);
        const randomId = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random number
        this.orderID = `GL-OD-${ stateInitials }-${ randomId }`;
    }
    next();
})

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;