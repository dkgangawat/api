const Vehicle = require('../models/VehicleSchema');
const getPincodeDistance = require('./getPincodeDistance');

const transportAlgo = async (pickupPincodes, orderSize, dropOffPincode,bagSize) => {
  try {
    const vehicles = await Vehicle.find({
      totalVcCapacity: {$gte: orderSize},
      status:'Approved',
      serviceablePickupPoints: {$in: [pickupPincodes]},
      serviceableDropOffPoints: {$in: [dropOffPincode]},
    });
    const numberOfVehicles = [];

    for (const vehicle of vehicles) {
      const distanceHubToPP = await getPincodeDistance(vehicle.hubPinCode, pickupPincodes);
      const distancePPToDP = await getPincodeDistance(pickupPincodes, dropOffPincode);
      const noOfVehicleRequired= Math.ceil((orderSize*bagSize)/ vehicle.capacity)
      if(vehicle.availableToday>= noOfVehicleRequired){
          numberOfVehicles.push({
        vehicle,
        noOfVehicleRequired,
        distanceHubToPP,
        distancePPToDP,
      });
      }
    }
    numberOfVehicles.sort((a, b) => {
      return ((a.distanceHubToPP + a.distancePPToDP) * a.vehicle.ratePerKm * a.noOfVehicleRequired + a.noOfVehicleRequired * a.vehicle.loadingCharges) - ((b.distanceHubToPP + b.distancePPToDP) * b.vehicle.ratePerKm * b.noOfVehicleRequired + b.noOfVehicleRequired * b.vehicle.loadingCharges);
    });
    console.log(numberOfVehicles)
    let efficientTransporter;
    let efficientVehicle;
    let efficientNumberOfVehicles;
    for (let i = 0; i < numberOfVehicles.length; i++) {
      if (i === numberOfVehicles.length - 1) {
        efficientTransporter = numberOfVehicles[i].vehicle.transporterID;
        efficientVehicle = numberOfVehicles[i].vehicle;
        efficientNumberOfVehicles = numberOfVehicles[i].noOfVehicleRequired;
        break;
      }
      if (numberOfVehicles[i].noOfVehicleRequired <= numberOfVehicles[i + 1].noOfVehicleRequired) {
        efficientTransporter = numberOfVehicles[i].vehicle.transporterID;
        efficientVehicle = numberOfVehicles[i].vehicle;
        efficientNumberOfVehicles = numberOfVehicles[i].noOfVehicleRequired;

        break;
      }
    }
    return {efficientVehicle, efficientTransporter, numberOfvehicles: efficientNumberOfVehicles};
  } catch (error) {
    throw new Error('Error in transportAlgo function: ' + error.message);
  }
};

module.exports = transportAlgo;
