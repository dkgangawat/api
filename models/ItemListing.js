const mongoose = require('mongoose');
const { generateItemID } = require('../helper/generateUniqueId');

const itemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true
    },
    itemDescription: String,
    itemFieldArea: Number,
    harvestDate: {
        type: Date,
        required: true,
        immutable: true,
    },
    sowingDate: {
        type: Date,
    },
    itemImages: [{
        type: String
    }, ],
    bagSize: {
        type: Number,
    },
    totalStock: {
        type: Number,
    },
    specialRequest: {
        type: String,
    },
    minOrderAmount: {
        type: Number,
    },
    price: {
        type: Number,
    },
    pickupAddresses: [{
        type: String,
    }, ],
    pinCode: {
        type: String,
    },
    state: {
        type: String,
        required: true,
        immutable: true,
    },
    schedulePublishDate: {
        type: Date,
    },
    itemID: {
        type: String,
        unique: true,
        immutable: true,
    },
    seller: {
        // type: mongoose.Schema.Types.ObjectId,
        type: String,
        // ref: 'Seller',
        required: true,
    },
    isDraft: {
        type: Boolean,
        required: true,
        default: true,
    },
});

//generating a item id 
itemSchema.pre('save', async function(next) {
    if (!this.s_id) { this.itemID = generateItemID(this.state, this.harvestDate) }
    next();
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;