const express = require('express');
const router = new express.Router();
const Transporter = require('../models/transporterSchema');
const { authenticateToken } = require('../middlewares/authenticateToken');
const bcrypt = require('bcrypt');
const { generateToken } = require('../helper/generateToken');
const { generateVehicleId, generateHubId } = require('../helper/generateUniqueId');
const Vehicle = require('../models/VehicleSchema');
const { updateAvailableToday } = require('../helper/updateAvailableToday');
const Order = require('../models/orderSchema');

// Action 1: Registration
router.post('/registration', async(req, res) => {
    try {
        const { phone, email, password, state } = req.body;

        // Create a new transporter document
        const transporter = new Transporter({
            phone,
            email,
            password,
            state,
        });

        const newTransporter = await transporter.save();
        const token = generateToken(newTransporter.transporterID);
        res.cookie('user', token)
        res.status(201).json({ transporterID: newTransporter.transporterID, newTransporter });
    } catch (error) {
        console.error('Error registering transporter:', error);
        res.status(500).json({ error: `Internal server error, ${error.message}` });
    }
});

// Action 2: Details
router.put('/details', async(req, res) => {
    try {
        const transporterID = req.userId;
        const details = req.body;

        const transporter = await Transporter.findOne({ transporterID });

        transporter.details = details;
        const updatedTransporter = await transporter.save();

        res.json({ transporterID: updatedTransporter.transporterID, updatedTransporter });
    } catch (error) {
        console.error('Error updating transporter details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/specific', async(req, res) => {
    try {
        const transporterID = req.userId;

        const transporter = await Transporter.findOne({ transporterID });

        if (!transporter) {
            return res.status(404).json({ error: 'transporter not found' });
        }

        res.status(200).json(transporter);
    } catch (error) {
        console.error('Error retrieving transporter', error);
        res.status(500).json({ error: 'Failed to retrieve transporter' });
    }
});
router.post('/login', async(req, res) => {
    const { emailOrPhone, password } = req.body;

    try {
        const transporter = await Transporter.findOne({
            $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
        });

        if (!transporter) {
            return res.status(404).json({ error: 'transporter not found' });
        }

        // Compare the password with the hashed password
        const isPasswordMatch = await bcrypt.compare(password, transporter.password);

        if (!isPasswordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const token = generateToken(transporter.transporterID);
        res.cookie('user', token);
        res.json({ message: 'Login successful', transporter, token });
    } catch (error) {
        console.error('Error during transporter login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/hub', async(req, res) => {
    try {
        const transporterID = req.userId;
        console.log(transporterID)
        const { hubName, hubPinCode } = req.body;
        const transporter = await Transporter.findOne({ transporterID });
        const hubId = generateHubId(transporterID, hubPinCode)
        const newHub = {
            hubName,
            hubPinCode,
            hubId
        };

        transporter.hubs.push(newHub);
        const updatedTransporter = await transporter.save();

        res.json({ transporterID: updatedTransporter.transporterID, newHub });
    } catch (error) {
        console.error('Error adding hub:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Action 4: Add Vehicle Category
router.post('/vehicle-category/:hubId', async(req, res) => {
    try {
        const transporterID = req.userId
        const { hubId } = req.params;
        const { vehicleCategory, capacity, ratePerKm, loadingCharges, serviceablePickupPoints, serviceableDropOffPoints, numberOfVehicles } = req.body;

        // Find the transporter document by transporterID
        const transporter = await Transporter.findOne({ transporterID });

        if (!transporter) {
            return res.status(404).json({ error: 'Transporter not found' });
        }

        // Find the hub in the transporter's hubs array by hubID
        const hub = transporter.hubs.find(hub => hub.hubId === hubId);

        if (!hub) {
            return res.status(404).json({ error: 'Hub not found' });
        }
        const vehicleId = generateVehicleId()
        const vehicle = new Vehicle({
            vehicleId,
            transporterID,
            hubId,
            hubName: hub.hubName,
            hubPinCode: hub.hubPinCode,
            vehicleCategory,
            capacity,
            ratePerKm,
            loadingCharges,
            serviceablePickupPoints,
            serviceableDropOffPoints,
            numberOfVehicles,
            status: 'Waiting for Approval',
        });
        const newVehicle = await vehicle.save();
        hub.vehicleCategories.push(newVehicle._id)
        await transporter.save()
        res.status(201).json({ newVehicle });
    } catch (error) {
        console.error('Error adding vehicle category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/vehicle-management', async(req, res) => {
    try {
        const transporterID = req.userId
        const transporter = await Transporter.findOne({ transporterID })
        if (!transporter) {
            throw Error("No such user")
        }
        res.status(200).json({ hubs: transporter.hubs })
    } catch (error) {
        console.error('Error ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.put('/vehicle-management/available-today', async(req, res) => {
    try {
        const { vehicleId, availableToday } = req.body
        const updatecResult = await updateAvailableToday(vehicleId, availableToday)
        res.status(200).json(updatecResult)
    } catch (error) {
        console.error('Error ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.put('/vehicle-management/update/:vehicleId', async(req, res) => {
    const { vehicleId } = req.params;
    const updatedFields = req.body;


    try {
        const transporterID = req.userId;
        const vehicle = await Vehicle.findOne({ vehicleId });

        if (!vehicle || transporterID !== vehicle.transporterID) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        if (vehicle.status === 'Waiting for Approval') {
            throw new Error('Vehicle is currently under review by the admin, please wait.... ')
        }
        for (const field in updatedFields) {
            if (field in vehicle) {
                if (field != 'status') vehicle[field] = updatedFields[field];
            } else {
                throw new Error(` invalid field, ${field} `)
            }
        }
        vehicle.status = 'Waiting for Approval'

        const updatedVehicle = await vehicle.save();

        res.status(200).json({ message: 'Vehicle updated successfully and request sent to Admin', updatedVehicle });
    } catch (error) {
        console.error('Error: ', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/vehicle-management/update/:vehicleId/delete', async(req, res) => {
    const vehicleId = req.params.vehicleId;

    try {
        const transporterID = req.userId;
        const transporter = await Transporter.findOne({ transporterID });
        const vehicel = await Vehicle.findOne({ vehicleId })
        if (!vehicel || transporterID !== vehicel.transporterID) {
            return res.status(404).json({ message: "vehicel not found" })
        }
        if (!transporter) {
            return res.status(404).json('transporterID not found');
        }

        const deleteVehicle = await Vehicle.findOneAndRemove({ vehicleId });

        transporter.hubs.forEach((hub) => {
            hub.vehicleCategories.forEach((vehicleCategory, index) => {
                if (vehicleCategory.equals(deleteVehicle._id)) {
                    hub.vehicleCategories.splice(index, 1);
                }
            });
        });

        await transporter.save();

        res.status(200).json({ deleteVehicle });
    } catch (error) {
        console.error('Error: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/orders/:status', async(req, res) => {
    const { status } = req.params;
    const { userId } = req;
    try {

        if (status === 'pending') {
            const orders = await Order.find({ 'transporter.transporterId': userId, $and: [{ status: { $ne: null } }, { status: { $ne: 'fulfilled' } }], paymentStatus: 'completed' }).populate('itemRef');
            return res.json(orders);
        } else if (status === 'fulfilled') {
            const orders = await Order.find({ 'transporter.transporterId': userId, status: 'fulfilled', paymentStatus: 'completed' }).populate('itemRef');
            res.json(orders);
        } else {
            return res.status(400).json({ message: 'Invalid status' });
        }

    } catch (error) {
        console.error('Error retrieving orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/update-order-status/:orderId', async(req, res) => {
    const { orderId } = req.params;
    const { userId } = req;
    const { status } = req.body;

    try {
        const order = await Order.findOne({ orderID: orderId, 'transporter.transporterId': userId });

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found or does not belong to the transporter' });
        }

        if (order.sellerVerified !== 'pending') {
            return res.status(400).json({ success: false, error: 'Order status cannot be updated' });
        }

        order.status = status;
        const result = await order.save()

        if (result) {
            return res.json({ success: true, message: 'Order status updated successfully' });
        } else {
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

module.exports = router;