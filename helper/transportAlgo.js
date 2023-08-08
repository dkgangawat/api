const Vehicle = require('../models/VehicleSchema');
const getPincodeDistance = require('./getPincodeDistance');

const transportAlgo = async (pickupPincodes, orderSize, dropOffPincode, bagSize) => {
  try {
    const vehicles = await Vehicle.find({
      totalVcCapacity: {$gte: orderSize},
      status: 'Approved',
      serviceablePickupPoints: {$in: [pickupPincodes]},
      serviceableDropOffPoints: {$in: [dropOffPincode]},
      isActive: true,
    });
    const numberOfVehicles = [];

    for (const vehicle of vehicles) {
      const distanceHubToPP = await getPincodeDistance(vehicle.hubPinCode, pickupPincodes);
      const distancePPToDP = await getPincodeDistance(pickupPincodes, dropOffPincode);
      const noOfVehicleRequired= Math.ceil((orderSize*bagSize)/ vehicle.capacity);
      if (vehicle.availableToday>= noOfVehicleRequired) {
        numberOfVehicles.push({
          vehicle,
          noOfVehicleRequired,
          distanceHubToPP,
          distancePPToDP,
        });
      }
    }
    const totalPrice = (a)=>(a.distanceHubToPP + a.distancePPToDP) * a.vehicle.ratePerKm * a.noOfVehicleRequired + a.noOfVehicleRequired * a.vehicle.loadingCharges;
    numberOfVehicles.sort((a, b) => {
      return totalPrice(a)-totalPrice(b);
    });
    const groupedArray = numberOfVehicles.reduce((result, object) => {
      const lastGroup = result[result.length - 1];
      if (lastGroup && lastGroup[0].noOfVehicleRequired === object.noOfVehicleRequired) {
        lastGroup.push(object);
      } else {
        result.push([object]);
      }
      return result;
    }, []);

    let efficientTransporter;
    let efficientVehicle;
    let efficientNumberOfVehicles;
    if (groupedArray.length>0) {
      if (groupedArray[0].length===1) {
        efficientTransporter = groupedArray[0][0].vehicle.transporterID;
        efficientVehicle = groupedArray[0][0].vehicle;
        efficientNumberOfVehicles = groupedArray[0][0].noOfVehicleRequired;
      } else {
        groupedArray[0].sort((a, b)=>{
          return a.noOfVehicleRequired - b.noOfVehicleRequired;
        });
        efficientTransporter = groupedArray[0][0].vehicle.transporterID;
        efficientVehicle = groupedArray[0][0].vehicle;
        efficientNumberOfVehicles = groupedArray[0][0].noOfVehicleRequired;
      }
    }
    return {efficientVehicle, efficientTransporter, numberOfvehicles: efficientNumberOfVehicles};
  } catch (error) {
    throw new Error('Error in transportAlgo function: ' + error.message);
  }
};

module.exports = transportAlgo;
