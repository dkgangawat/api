const Vehicle = require("../models/VehicleSchema")
const transportAlgo = async(pickupPincodes, orderSize, dropOffPincode) => {
    const vehicles = await Vehicle.find({ totalVcCapacity: { $gte: orderSize }, serviceablePickupPoints: { $in: [pickupPincodes] }, serviceableDropOffPoints: { $in: [dropOffPincode] } })
    const numberOfvehicle = []
    vehicles.forEach(vehicle => {
        numberOfvehicle.push({ vehicleId: vehicle.vehicleId, noOfVehicleRequired: Math.ceil(orderSize / vehicle.capacity) })
    })
    console.log(vehicles, numberOfvehicle)
}

transportAlgo("781002", 900, "781006")