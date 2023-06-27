const express = require('express');

const Buyer = require('../models/buyerSchema');
const Item = require('../models/ItemListing');
const bcrypt = require('bcrypt');
const router = new express.Router();
const { generateToken } = require('../helper/generateToken');
const Order = require('../models/orderSchema');
const { authenticateToken } = require('../middlewares/authenticateToken');


router.post('/registration', async(req, res) => {
    try {
        const { phone, email, password, state } = req.body;
        const buyer = new Buyer({
            phone,
            email,
            password,
            state,
        });

        const createdUser = await buyer.save();
        const token = generateToken(createdUser.b_id)
        res.cookie('user', token)
        res.status(201).json({ message: 'Step 1: Registration completed successfully as a Buyer', b_id: createdUser.b_id });
    } catch (error) {
        console.error('Error creating Buyer', error);
        res.status(500).json({ error: 'Failed to create Buyer' });
    }
});

// Update a Buyer - Step 2: Additional Details
router.put('/details', async(req, res) => {
    try {
        const bId = req.userId;
        const { fullName, dateOfBirth, currentAddress, establishmentYear, billingAddress } = req.body;
        const buyer = await Buyer.findOne({ b_id: bId });

        if (!buyer) {
            return res.status(404).json({ error: 'buyer not found' });
        }

        buyer.fullName = fullName;
        buyer.dateOfBirth = dateOfBirth;
        buyer.currentAddress = currentAddress;
        buyer.establishmentYear = establishmentYear;
        buyer.billingAddress = billingAddress;

        await buyer.save();

        res.status(200).json({ message: 'Step 2: Additional details completed successfully as a buyer' });
    } catch (error) {
        console.error('Error updating buyer', error);
        res.status(500).json({ error: 'Failed to update buyer' });
    }
});

// Get a buyer by ID for admin use
router.get('/specific', async(req, res) => {
    try {
        const bId = req.userId;

        const buyer = await Buyer.findOne({ b_id: bId });

        if (!buyer) {
            return res.status(404).json({ error: 'buyer not found' });
        }

        res.status(200).json(buyer);
    } catch (error) {
        console.error('Error retrieving buyer', error);
        res.status(500).json({ error: 'Failed to retrieve buyer' });
    }
});

// login buyer
router.post('/login', async(req, res) => {
    const { emailOrPhone, password } = req.body;

    try {
        const buyer = await Buyer.findOne({
            $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
        });

        if (!buyer) {
            return res.status(404).json({ error: 'buyer not found' });
        }

        // Compare the password with the hashed password
        const isPasswordMatch = await bcrypt.compare(password, buyer.password);

        if (!isPasswordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const token = generateToken(buyer.b_id);
        res.cookie('user', token);
        res.json({ message: 'Login successful', buyer, token });
    } catch (error) {
        console.error('Error during buyer login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Buyer browsing items
router.get('/items', async(req, res) => {
    try {
        const currentDate = new Date();
        const items = await Item.find({
            $or: [
                { schedulePublishDate: { $lte: currentDate } },
                { schedulePublishDate: { $exists: false } },
                { schedulePublishDate: "" }
            ],
            totalStock: { $gt: 0 },
            isDraft: false
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch items.' });
    }
});
// router.get('/orders', async(req, res) => {
//     const { userId } = req;
//     try {
//         const orders = await Order.find({ buyerID: userId, status: { $ne: null } });
//         res.json(orders);

//     } catch (error) {
//         console.error('Error retrieving orders:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// })
router.get('/orders/:status', async(req, res) => {
    const { status } = req.params;
    const { userId } = req;
    try {

        if (status === 'pending') {
            const orders = await Order.find({ buyerID: userId, status: { $ne: null }, paymentStatus: 'completed' }).populate('itemRef');
            return res.json(orders);
        } else if (status === 'fulfilled') {
            const orders = await Order.find({ buyerID: userId, status: 'fulfilled', paymentStatus: 'completed' }).populate('itemRef');
            res.json(orders);
        } else {
            return res.status(400).json({ message: 'Invalid status' });
        }

    } catch (error) {
        console.error('Error retrieving orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/order/confirm-received/:orderId', async(req, res) => {
    const { orderId } = req.params;
    const { userId } = req;

    try {
        const { imageLink1, imageLink2 } = req.body;
        const order = await Order.findOne({ orderID: orderId });
        if (!order || userId !== order.buyerID) {
            return res.status(404).json({ error: 'Order not found' });
        }
        order.fulfilled.push(imageLink1, imageLink2);
        order.status = 'fulfilled';
        await order.save();

        res.json({ message: 'Order received and fulfilled successfully' });
    } catch (error) {
        console.error('Error: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router;