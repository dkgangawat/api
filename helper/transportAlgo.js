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
console.log(vehicles)
    const numberOfVehicles = [];

    for (const vehicle of vehicles) {
      const distanceHubToPP = await getPincodeDistance(vehicle.hubPinCode, pickupPincodes);
      const distancePPToDP = await getPincodeDistance(pickupPincodes, dropOffPincode);

      console.log(distanceHubToPP, distancePPToDP);

      numberOfVehicles.push({

        vehicle,
        noOfVehicleRequired: Math.ceil((orderSize*bagSize)/ vehicle.capacity),
        distanceHubToPP,
        distancePPToDP,
      });
    }
    numberOfVehicles.sort((a, b) => {
      return ((a.distanceHubToPP + a.distancePPToDP) * a.vehicle.ratePerKm * a.noOfVehicleRequired + a.noOfVehicleRequired * a.vehicle.loadingCharges) - ((b.distanceHubToPP + b.distancePPToDP) * b.vehicle.ratePerKm * b.noOfVehicleRequired + b.noOfVehicleRequired * b.vehicle.loadingCharges);
    });
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
    console.error('Error', error);
  }
};

module.exports = transportAlgo;
