const express = require('express');

const Seller = require('../models/seller');

const router = express.Router();



router.post('/seller-registration', async(req, res) => {
    try {
        const { phone, email, password, state } = req.body;
        const seller = new Seller({
            phone,
            email,
            password,
            state,
            draft: true
        });

        const createdUser = await seller.save();
        // res.redirect(`/seller-details/${createdUser._id}`)
        res.status(201).json({ message: 'Step 1: Registration completed successfully', s_id: createdUser.s_id });
        // res.status(302).send(`<html><body><p> Redirecting to <a href=${`/seller-details/${}`}></a> </p></body></html>`)
    } catch (error) {
        console.error('Error creating seller', error);
        res.status(500).json({ error: 'Failed to create seller' });
    }
});

// Update a seller - Step 2: Additional Details
router.put('/seller-details/:s_id', async(req, res) => {
    try {
        const { s_id } = req.params;
        const { fullName, dateOfBirth, currentAddress, addressProof, bankDetails, escrowTermsAccepted, sellerVerificationDocuments, highestQualification, draft } = req.body;
        const seller = await Seller.findOne({ s_id });

        if (!seller) {
            return res.status(404).json({ error: 'Seller not found' });
        }

        seller.fullName = fullName;
        seller.dateOfBirth = dateOfBirth;
        seller.currentAddress = currentAddress;
        seller.addressProof = addressProof;
        seller.bankDetails = bankDetails;
        seller.escrowTermsAccepted = escrowTermsAccepted;
        seller.sellerVerificationDocuments = sellerVerificationDocuments;
        seller.highestQualification = highestQualification;
        seller.draft = draft;

        await seller.save();

        res.status(200).json({ message: 'Step 2: Additional details completed successfully' });
    } catch (error) {
        console.error('Error updating seller', error);
        res.status(500).json({ error: 'Failed to update seller' });
    }
});

// Get a seller by ID
router.get('/seller/:s_id', async(req, res) => {
    try {
        const { s_id } = req.params;

        const seller = await Seller.findOne({ s_id });

        if (!seller) {
            return res.status(404).json({ error: 'Seller not found' });
        }

        res.status(200).json(seller);
    } catch (error) {
        console.error('Error retrieving seller', error);
        res.status(500).json({ error: 'Failed to retrieve seller' });
    }
});



module.exports = router;