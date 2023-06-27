const express = require('express');
const router = new express.Router();
const Item = require('../models/ItemListing');
const Order = require('../models/orderSchema');
const Buyer = require('../models/buyerSchema');
const { updateOrderStatus } = require('../helper/updateOrderStatus');
router.post('/', async(req, res) => {
    try {
        const { itemID, orderSize, wantShipping, dropoffLocation } = req.body;

        // Fetch item details from the provided Item ID
        const item = await Item.findOne({ itemID });
        if (item.minOrderAmount <= orderSize && orderSize <= item.totalStock) {
            const sellerID = item.seller
            const buyerID = req.userId
            const buyer = await Buyer.findOne({ b_id: buyerID })
            const buyerState = buyer.state
                // Calculate product cost
            const productCost = item.price * orderSize;

            // Calculate shipping cost
            const shippingCost = 0;
            if (wantShipping && dropoffLocation) {
                //  shipping algorithm to calculate the shipping cost based on dropoff location
                // shippingCost = calculateShippingCost(dropoffLocation);
            }

            // Calculate total cost
            const totalCost = productCost + shippingCost;

            // Save the order details in the database
            const order = new Order({
                itemID,
                itemRef: item._id,
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

            res.json({ orderID: newOrder.orderID, newOrder });
        } else {
            res.status(404).json({ message: "order size should be greater than or equal to min order size and less then equal to toal stock " })
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Payment route
router.post('/payment', async(req, res) => {
    try {
        const { orderID, paymentStatus } = req.body;
        console.log(orderID)
        if (!orderID || !paymentStatus) {
            res.status(404).json({ message: "not found" })
        };
        let updatedOrder = await Order.findOneAndUpdate({ orderID }, { paymentStatus }, { new: true })
        await updateOrderStatus(orderID, "Waiting for seller")
        res.json({ message: 'Payment successful', updatedOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;