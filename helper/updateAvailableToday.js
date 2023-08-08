const Vehicle = require('../models/VehicleSchema');


const updateAvailableToday = async (vehicleId, noOfVehicles) => {
  try {
    const vehicle = await Vehicle.findOne({vehicleId, isActive: true});
    if (!vehicle) {
      return {success: false, error: 'vehicle not found'};
    }
    if (vehicle.status === 'Waiting for Approval') {
      throw new Error('Vehicle is currently under review by the admin, please wait.... ');
    }
    if (vehicle.numberOfVehicles < noOfVehicles) {
      throw new Error('number of vehicle avilabe today should be less then total vehicles  ');
    }
    vehicle.availableToday = noOfVehicles,
    vehicle.totalVcCapacity = vehicle.availableToday * vehicle.capacity;
    await vehicle.save();

    return {success: true, message: 'total vehicle Available today updated'};
  } catch (error) {
    return {success: false, error: error.message};
  }
};
module.exports = {updateAvailableToday};
