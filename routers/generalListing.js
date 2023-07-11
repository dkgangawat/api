const express = require('express');
const router = new express.Router();
const Item = require('../models/ItemListing');
const Seller = require('../models/seller');
const AgriJodVerificationRequest = require('../models/agriJodVerificationRequestSchema');
const {generateAgriJodVerificationId} = require('../helper/generateUniqueId');
const getPincodeAddress = require('../helper/getPincodeAddress');

// Create a new item
router.post('/', async (req, res) => {
  try {
    const seller = req.userId;
    const sellerExist = await Seller.findOne({s_id: seller});
    if (!sellerExist) {
      return res.status(404).json({error: 'seller not found'});
    }
    const {itemName, itemDescription, itemFieldArea, harvestDate, sowingDate, itemImages, bagSize, totalStock, specialRequest, minOrderAmount, price, pickupAddresses, pinCode, state, schedulePublishDate, isDraft} = req.body;
   const postalAddress = await getPincodeAddress(pinCode)
    const newItem = new Item({itemName, itemDescription, itemFieldArea, harvestDate, sowingDate,postalAddress, itemImages, bagSize, totalStock, specialRequest, minOrderAmount, price, pickupAddresses, pinCode, state, schedulePublishDate, seller, isDraft});
    if (harvestDate.trim() && state.trim()) {
      if (totalStock < minOrderAmount) {
        return res.status(400).json({message: 'total stocks should me more than minimum order amount'});
      }
      const createdItme = await newItem.save();
      res.status(201).json(createdItme);
    } else {
      res.status(500).json({message: 'harvest date and state must required to a item'});
    }
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

// Update an item
router.put('/:itemID', async (req, res) => {
  try {
    const sellerId = req.userId;
    const sellerExist = await Seller.findOne({s_id: sellerId});
    const {itemID} = req.params;
    const item = await Item.findOne({itemID});
    if (!sellerExist || sellerId !== item.seller) {
      return res.status(404).json({error: ' no item found'});
    }
    const updatedFields = req.body;
    for (const field in updatedFields) {
      if (field in item) {
        item[field] = updatedFields[field];
      } else {
        throw new Error(` invalid field, ${field} `);
      }
    }
    const updatedItem = await item.save();
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

// Get item details
router.get('/:itemID', async (req, res) => {
  try {
    const sellerId = req.userId;
    const {itemID} = req.params;
    const item = await Item.findOne({itemID});
    if (!item || sellerId !== item.seller) {
      return res.status(404).json({error: 'Item not found'});
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});
router.post('/agrijod-verification/request/:itemId', async (req, res) => {
  const {itemId} = req.params;
  const {userId} = req;
  const {certification, itemImages, comments} = req.body;

  try {
    const item = await Item.findOne({itemID: itemId, seller: userId});
    const seller = await Seller.findOne({s_id: userId});
    if (!item || !seller) {
      return res.status(404).json({error: 'either you are not a seller or item does not belong to you'});
    }
    const verificationRequest = new AgriJodVerificationRequest({
      seller: seller._id,
      item: item._id,
      certification,
      itemImages,
      comments,
      requestId: generateAgriJodVerificationId(),
    });
    const newRequest = await verificationRequest.save();

    res.json({message: 'AgriJod verification request submitted successfully', newRequest});
  } catch (error) {
    console.error('Error: ', error);
    res.status(500).json({error: error.message});
  }
});


//

module.exports = router;
