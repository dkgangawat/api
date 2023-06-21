const express = require('express');
const router = express.Router();
const Item = require('../models/ItemListing');
const Order = require('../models/orderSchema');
const { authenticateToken } = require('../middlewares/authenticateToken');
const Buyer = require('../models/buyerSchema');
router.post('/', async(req, res) => {
    try {
        const { itemID, orderSize, wantShipping, dropoffLocation } = req.body;

        // Fetch item details from the provided Item ID
        const item = await Item.findOne({ itemID });
        const sellerID = item.state
        const buyerID = authenticateToken()
        const buyer = Buyer.findOne({ b_id: buyerID })
        const buyerState = buyer.state
            // Calculate product cost
        const productCost = item.price * orderSize;

        // Calculate shipping cost
        let shippingCost = 0;
        if (wantShipping && dropoffLocation) {
            //  shipping algorithm to calculate the shipping cost based on dropoff location
            // shippingCost = calculateShippingCost(dropoffLocation);
        }

        // Calculate total cost
        const totalCost = productCost + shippingCost;

        // Save the order details in the database
        const order = new Order({
            itemID,
            sellerID,
            buyerID,
            buyerState,
            orderSize,
            wantShipping,
            dropoffLocation,
            productCost,
            shippingCost,
            totalCost,
            paymentStatus: 'initiated'
        });
        const newOrder = await order.save();

        res.json({ orderID: newOrder.orderID });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Payment route
router.post('/payment', async(req, res) => {
    try {
        const { orderID } = req.body;

        // Verify the payment and update payment status to 'completed' if successful
        // await verifyPayment(orderID);

        // Update seller status to 'pending' and send notification to the seller
        // await updateSellerStatus(orderID, 'pending');
        // sendNotificationToSeller(orderID, 'pending');

        res.json({ message: 'Payment successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Utility function to calculate shipping cost based on dropoff location
function calculateShippingCost(dropoffLocation) {
    // Your shipping algorithm logic goes here
    // Return the calculated shipping cost
}

module.exports = router;