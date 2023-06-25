const mongoose = require('mongoose');


const vehicleSchema = new mongoose.Schema({
    vehicleId: {
        type: String,
        required: true,
        unique: true,
        immutable: true,
    },
    transporterID: {
        type: String,
        required: true
    },
    hubId: String,
    hubName: String,
    hubPinCode: String,
    vehicleCategory: String,
    capacity: Number,
    ratePerKm: Number,
    loadingCharges: Number,
    serviceablePickupPoints: {
        type: [
            String
        ]
    },
    serviceableDropOffPoints: {
        type: [
            String
        ]
    },
    noOfVehicles: Number,
    status: {
        type: String,
        enum: ['Waiting for Approval', 'Approved'],
        default: 'Waiting for Approval'
    },
    availableToday: {
        type: Number,
        default: 0,
        immutable: function() {
            return !this.status === 'Approved'
        }
    }
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;