const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { generateBuyerID } = require('../helper/generateUniqueId');

const buyerSchema = new mongoose.Schema({
    b_id: {
        type: String,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        match: [/^\d{10}$/, 'Phone number should be 10 digits']
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
    },
    state: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    fullName: String,
    category: String,
    dateOfBirth: Date,
    establishmentYear: String,
    billingAddress: String,
    currentAddress: String,
});

// generating a buyer id
buyerSchema.pre('save', async function(next) {
    if (this.isNew) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(this.password, saltRounds);
        this.password = hashedPassword;
        if (!this.b_id) {
            this.b_id = generateBuyerID(this.state);
        }
    }
    next();
});

const Buyer = mongoose.model('Buyer', buyerSchema);

module.exports = Buyer;