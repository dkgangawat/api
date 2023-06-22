const express = require('express');

const Buyer = require('../models/buyerSchema');
const Item = require('../models/ItemListing')
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = require('../config/config');


router.post('/registration', async(req, res) => {
    try {
        const { phone, email, password, state } = req.body;
        const buyer = new Buyer({
            phone,
            email,
            password,
            state
        });

        const createdUser = await buyer.save();
        res.status(201).json({ message: 'Step 1: Registration completed successfully as a Buyer', b_id: createdUser.b_id });
    } catch (error) {
        console.error('Error creating Buyer', error);
        res.status(500).json({ error: 'Failed to create Buyer' });
    }
});

// Update a Buyer - Step 2: Additional Details
router.put('/details/:b_id', async(req, res) => {
    try {
        const { b_id } = req.params;
        const { fullName, dateOfBirth, currentAddress, establishmentYear, billingAddress } = req.body;
        const buyer = await Buyer.findOne({ b_id });

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
router.get('/specific/:b_id', async(req, res) => {
    try {
        const { b_id } = req.params;

        const buyer = await Buyer.findOne({ b_id });

        if (!buyer) {
            return res.status(404).json({ error: 'buyer not found' });
        }

        res.status(200).json(buyer);
    } catch (error) {
        console.error('Error retrieving buyer', error);
        res.status(500).json({ error: 'Failed to retrieve buyer' });
    }
});

//login buyer
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

        const token = jwt.sign({ userId: buyer.b_id }, JWT_SECRET_KEY);

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
            totalStock: { $gt: 0 }
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch items.' });
    }
});



module.exports = router;