const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { generateTransporterId } = require('../helper/generateUniqueId');
const regex = require('../helper/regex');
const transporterSchema = new mongoose.Schema({
    transporterID: {
        type: String,
        unique: true,
        index: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        index: true,
        match: regex.phone
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        match: regex.email
    },
    password: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    details: {
        pocName: String,
        companyName: String,
        companyAddress: String,
        gstin: {
            type: String,
            match: regex.gstin
        },
        companyPAN: String,
        cin: String,
        companySize: {
            vehicles: Number,
            drivers: Number,
            humanLabours: Number,
        },
        businessLicence: String,
        bankDetails: {
            accountNumber: {
                type: String,
                match: regex.bankAccountNumber
            },
            ifscCode: {
                type: String,
                match: regex.ifscCode
            },
        },
        acceptTerms: Boolean,
    },
    hubs: {
        type: [{
            hubName: String,
            hubPinCode: String,
            hubId: String,
            vehicleCategories: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Vehicle'
            }],
        }],
        default: []
    },
});

transporterSchema.pre('save', async function(next) {
    if (this.isNew) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(this.password, saltRounds);
        this.password = hashedPassword;
        if (!this.transporterID) {
            this.transporterID = generateTransporterId(this.state);
            console.log(this.transporterID)
        }
    }
    next();
});
transporterSchema.pre('findOne', function(next) {
    this.populate('hubs.vehicleCategories');
    next();
});
const Transporter = mongoose.model('Transporter', transporterSchema);

module.exports = Transporter;