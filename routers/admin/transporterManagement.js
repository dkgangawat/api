const express = require("express");
const Transporter = require("../../models/transporterSchema");
const VehicleUpdateRequest = require("../../models/vehicleUpdateRequests");
const Vehicle = require("../../models/VehicleSchema");
const router = new express.Router();

router.get("/", async (req, res) => {
  try {
    const transporters = await Transporter.find({}).populate(
      "hubs.vehicleCategories"
    );

    if (!transporters) {
      return res.status(404).json({ error: "Transporters not found" });
    }
    const transporterDetails = transporters.map((transporter) => {
      return {
        phone: transporter.phone,
        email: transporter.email,
        pocName: transporter.details?.pocName,
        companyName: transporter.details?.companyName,
        companyAddress: transporter.details?.companyAddress,
        hubAndVehicleDetails: transporter.hubs,
      };
    });

    res.status(200).json(transporterDetails);
  } catch (error) {
    console.error("Error fetching transporter details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/requests", async (req, res) => {
  try {
    const requests = await VehicleUpdateRequest.find({}).populate("vehicle");
    if (!requests) {
      return res.status(404).json({ message: "no requests right now" });
    }
    const requestsDetails = requests.map((request) => ({
    requestId: request.requestId,
      transporterID: request.vehicle?.transporterID,
      vehicleID: request.vehicle?.vehicleId,
      hubPincode: request.vehicle?.hubPinCode,
      hubId: request.vehicle?.hubId,
      oldData: request.requestType === "add" ? {
        serviceablePickupPoints: [],
        serviceableDropOffPoints: [],
        ratePerKm: null,
        loadingCharges:null
      } : {
        serviceablePickupPoints: request.vehicle?.serviceablePickupPoints,
        serviceableDropOffPoints: request.vehicle?.serviceableDropOffPoints,
        ratePerKm: request.vehicle?.ratePerKm,
        loadingCharges: request.vehicle?.loadingCharges,
      },
      newData: {
        serviceablePickupPoints: request.serviceablePickupPoints,
        serviceableDropOffPoints: request.serviceableDropOffPoints,
        ratePerKm: request.ratePerKm,
        loadingCharges: request.loadingCharges,
      }
    }));

    res.status(200).json({ requests:requestsDetails });
  } catch (error) {
    console.error("Error fetching transporter requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post('/request/:requestId/:action', async(req, res) => {
    const { requestId, action } = req.params;
    try {
        if (action !== 'accept' && action !== 'reject') throw new Error('action must be either accept or reject')
        const request = await VehicleUpdateRequest.findOne({ requestId }).populate('vehicle');
        const vehicle = await Vehicle.findOne({ vehicleId: request.vehicle?.vehicleId })
        
        if (!request || !vehicle) {
            return res.status(404).json({ error: 'invalid requestId' });
        }
        let message=''
        if (action == 'reject') {
            message= 'update request rejected'
            request.requestType === 'add'?vehicle.status = 'Request rejected':vehicle.status='Approved'
            
        } else if (action == 'accept') {
            vehicle.serviceablePickupPoints = request.serviceablePickupPoints
            vehicle.serviceableDropOffPoints = request.serviceableDropOffPoints
            vehicle.ratePerKm = request.ratePerKm
            vehicle.loadingCharges = request.loadingCharges
            message='update request accepted'
            vehicle.status= 'Approved'
        } else {
            res.status(404).json({ message: "action must be accept or reject" })
        }
       
      
        await vehicle.save()
        await request.deleteOne()
        res.json({ message});
    } catch (error) {
        console.error('Error updating verification action:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
