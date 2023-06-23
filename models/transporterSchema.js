const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { generateTransporterId } = require('../helper/generateUniqueId');
const transporterSchema = new mongoose.Schema({
    transporterID: {
        type: String,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
        match: [/^\d{10}$/, 'Phone number should be 10 digits'],
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
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
            validate: {
                validator: function(v) {
                    return /^[A-Z0-9]{15}$/.test(v);
                },
                message: 'Invalid GSTIN',
            },
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
                validate: {
                    validator: function(v) {
                        return /^\d{9,18}$/.test(v);
                    },
                    message: 'Invalid account number',
                },
            },
            ifscCode: {
                type: String,
                validate: {
                    validator: function(v) {
                        return /^[A-Za-z]{4}\d{7}$/.test(v);
                    },
                    message: 'Invalid IFSC code',
                },
            },
        },
        acceptTerms: Boolean,
    },
    hubs: [{
        hubName: String,
        hubPinCode: String,
        vehicleCategories: [{
            vehicleId: {
                type: String,
                required: true,
                unique: true
            },
            hubName: String,
            hubPinCode: String,
            vehicleCategory: String,
            capacity: Number,
            ratePerKm: Number,
            loadingCharges: Number,
            serviceablePickupPoints: [String],
            serviceableDropOffPoints: [String],
            noOfVehicles: Number,
            status: {
                type: String,
                enum: ['Waiting for Approval', 'Approved'],
                default: 'Waiting for Approval'
            }
        }],
    }],
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
const Transporter = mongoose.model('Transporter', transporterSchema);

module.exports = Transporter;