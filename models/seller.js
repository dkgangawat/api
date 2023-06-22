const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { generateSellerID } = require('../helper/generateUniqueId');

const sellerSchema = new mongoose.Schema({
    s_id: {
        type: String,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    state: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    draft: {
        type: Boolean,
        default: true
    },
    fullName: String,
    dateOfBirth: Date,
    currentAddress: String,
    addressProof: String,
    bankDetails: {
        accountNumber: {
            type: String,
            match: [/^\d{9,18}$/, 'Account number should be 9 to 18 digits']
        },
        ifscCode: {
            type: String,
            match: [/^[A-Za-z]{4}\d{7}$/, 'Invalid IFSC code']
        }
    },
    escrowTermsAccepted: Boolean,
    sellerVerificationDocuments: {
        identity: {
            idDocument: String,
            idNumber: String
        },
        license: {
            licenseDocument: String,
            licenseNumber: String
        },
        bankDetails: {
            passbookDocument: String,
            accountNumber: String,
            ifscCode: String
        }
    },
    highestQualification: String
});

//generating a seller id 
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