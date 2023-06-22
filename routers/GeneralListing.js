const express = require('express');
const router = express.Router();
const Item = require('../models/ItemListing');

// Create a new item
router.post('/', async(req, res) => {
    try {
        const { itemName, itemDescription, itemFieldArea, harvestDate, sowingDate, itemImages, bagSize, totalStock, specialRequest, minOrderAmount, price, pickupAddresses, pinCode, state, schedulePublishDate, seller, isDraft } = req.body

        const newItem = new Item({ itemName, itemDescription, itemFieldArea, harvestDate, sowingDate, itemImages, bagSize, totalStock, specialRequest, minOrderAmount, price, pickupAddresses, pinCode, state, schedulePublishDate, seller, isDraft });
        if (harvestDate.trim() && state.trim()) {
            if (totalStock < minOrderAmount) { return res.status(400).json({ message: "total stocks should me more than minimum order amount" }) }
            const createdItme = await newItem.save();
            res.status(201).json(createdItme);
        } else {
            res.status(500).json({ message: "harvest date and state must required to a item" });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update an item
router.put('/:itemID', async(req, res) => {
    try {
        const { itemID } = req.params;
        const item = await Item.findOneAndUpdate({ itemID }, req.body, { omitUndefined: true });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get item details
router.get('/:itemID', async(req, res) => {
    try {
        const { itemID } = req.params;
        const item = await Item.findOne({ itemID });
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//

module.exports = router;