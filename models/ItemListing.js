const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true,
    },
    itemDescription: {
        type: String,
        required: true,
    },
    itemFieldArea: {
        type: Number,
        required: true,
    },
    harvestDate: {
        type: Date,
        required: true,
    },
    sowingDate: {
        type: Date,
    },
    itemImages: [{
        type: String,
        required: true,
    }, ],
    bagSize: {
        type: Number,
        required: true,
    },
    totalStock: {
        type: Number,
        required: true,
    },
    specialRequest: {
        type: String,
    },
    minOrderAmount: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    pickupAddresses: [],
    pinCode: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    schedulePublishDate: {
        type: Date,
        required: true,
    },
    itemID: {
        type: String,
        required: true,
        unique: true,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        required: true,
    },
    isDraft: {
        type: Boolean,
        required: true,
        default: true,
    },
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;