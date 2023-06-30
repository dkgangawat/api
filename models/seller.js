const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { generateSellerID } = require('../helper/generateUniqueId');
const regex = require('../helper/regex');

const sellerSchema = new mongoose.Schema({
    s_id: {
        type: String,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        match: [/^\d{10}$/, 'Phone number should be 10 digits'],
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'],
    },
    state: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    draft: {
        type: Boolean,
        default: true,
    },
    fullName: String,
    dateOfBirth: Date,
    currentAddress: String,
    addressProof: String,
    bankDetails: {
        accountNumber: {
            type: String,
            match: regex.bankAccountNumber,
        },
        ifscCode: {
            type: String,
            match: regex.ifscCode,
        },
    },
    escrowTermsAccepted: Boolean,
    sellerVerificationDocuments: {
        identity: {
            idDocument: String,
            idNumber: String,
        },
        license: {
            licenseDocument: String,
            licenseNumber: String,
        },
        bankDetails: {
            passbookDocument: String,
            accountNumber: String,
            ifscCode: String,
        },
    },
    highestQualification: String,
});

// generating a seller id
sellerSchema.pre('save', async function(next) {
    if (this.isNew) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(this.password, saltRounds);
        this.password = hashedPassword;
        if (!this.s_id) {
            this.s_id = generateSellerID(this.state);
        }
    }
    next();
});

const Seller = mongoose.model('Seller', sellerSchema);

module.exports = Seller;