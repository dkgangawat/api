const mongoose = require('mongoose');


const vehicleUpdateSchema = new mongoose.Schema({
    requestId: {
        type: String,
        required: true,
        unique: true,
        immutable: true,
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true,
    },
    ratePerKm: Number,
    loadingCharges: {
        type: Number,
        default: 0
    },
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
}, { timestamps: true });

const VehicleUpdateRequest = mongoose.model('VehicleUpdateRequest', vehicleUpdateSchema);

module.exports = VehicleUpdateRequest;