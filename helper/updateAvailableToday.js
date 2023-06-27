const Vehicle = require("../models/VehicleSchema");



const updateAvailableToday = async(vehicleId, noOfVehicles) => {
    try {
        const vehicle = await Vehicle.findOne({ vehicleId })
        if (!vehicle) {
            return { success: false, error: 'vehicle not found' };
        }
        vehicle.availableToday = noOfVehicles,
            vehicle.totalVcCapacity = vehicle.availableToday * vehicle.capacity
        await vehicle.save();

        return { success: true, message: 'total vehicle Available today updated' };
    } catch (error) {
        console.error('Error updating :', error);
        return { success: false, error: 'Not approved by admin' };
    }
};
module.exports = { updateAvailableToday }