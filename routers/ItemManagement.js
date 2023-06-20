const express = require('express')
const item = require('../models/ItemListing')
const { authenticateToken } = require('../middlewares/authenticateToken')
const router = express.Router();

router.get('/', authenticateToken, async(req, res) => {
    const { userId } = req
    console.log(userId)
    try {
        const items = await item.find({ seller: userId })
        res.json(items)
    } catch (error) {
        console.error('Error retrieving items:', error);
        res.status(500).json({ error: 'Internal server error' });

    }
})

module.exports = router