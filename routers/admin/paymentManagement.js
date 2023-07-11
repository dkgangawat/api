const express = require("express");
const Payment = require("../../models/paymentSchema");
const router = new express.Router();

router.get('/', async (req, res) => {
    try {
        const payments = await Payment.find();
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}
);

module.exports = router;