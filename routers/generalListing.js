const express = require('express');
const router = new express.Router();
const Item = require('../models/ItemListing');
const { authenticateToken } = require('../middlewares/authenticateToken');
const Seller = require('../models/seller');

// Create a new item
router.post('/', async(req, res) => {
    try {
        const seller = req.userId
        const sellerExist = await Seller.findOne({ s_id: seller })
        if (!sellerExist) {
            return res.status(404).json({ error: 'seller not found' });
        }
        const { itemName, itemDescription, itemFieldArea, harvestDate, sowingDate, itemImages, bagSize, totalStock, specialRequest, minOrderAmount, price, pickupAddresses, pinCode, state, schedulePublishDate, isDraft } = req.body

        const newItem = new Item({ itemName, itemDescription, itemFieldArea, harvestDate, sowingDate, itemImages, bagSize, totalStock, specialRequest, minOrderAmount, price, pickupAddresses, pinCode, state, schedulePublishDate, seller, isDraft });
        if (harvestDate.trim() && state.trim()) {
            if (totalStock < minOrderAmount) {
                return res.status(400).json({ message: 'total stocks should me more than minimum order amount' });
            }
            const createdItme = await newItem.save();
            res.status(201).json(createdItme);
        } else {
            res.status(500).json({ message: 'harvest date and state must required to a item' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update an item
router.put('/:itemID', async(req, res) => {
    try {
        const sellerId = req.userId
        const sellerExist = await Seller.findOne({ s_id: sellerId })
        const { itemID } = req.params;
        const item = await Item.findOne({ itemID });
        if (!sellerExist || sellerId !== item.seller) {
            return res.status(404).json({ error: ' no item found' });
        }
        const { itemName, itemDescription, itemFieldArea, sowingDate, itemImages, bagSize, totalStock, specialRequest, minOrderAmount, price, pickupAddresses, pinCode, schedulePublishDate, isDraft } = req.body
        item.itemName = itemName;
        item.itemDescription = itemDescription;
        item.itemFieldArea = itemFieldArea;
        item.sowingDate = sowingDate;
        item.itemImages = itemImages;
        item.bagSize = bagSize;
        item.totalStock = totalStock;
        item.specialRequest = specialRequest;
        item.minOrderAmount = minOrderAmount;
        item.price = price;
        item.pickupAddresses = pickupAddresses;
        item.pinCode = pinCode;
        item.schedulePublishDate = schedulePublishDate;
        item.isDraft = isDraft;
        const updatedItem = await item.save();
        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get item details
router.get('/:itemID', async(req, res) => {
    try {
        const sellerId = req.userId
        const { itemID } = req.params;
        const item = await Item.findOne({ itemID });
        if (!item || sellerId !== item.seller) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//

module.exports = router;