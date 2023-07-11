const express = require('express');
const Seller = require('../../models/seller');
const Item = require('../../models/ItemListing');
const router = new express.Router();

router.get('/', async (req, res) => {
  try {
    const sellers = await Seller.find({}, 's_id fullName verified');
    res.json(sellers);
  } catch (error) {
    console.error('Error retrieving sellers:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

router.post('/:sellerID/verify/:verified', async (req, res) => {
  const {sellerID, verified} = req.params;
  try {
    const seller = await Seller.findOneAndUpdate({s_id: sellerID}, {verified}, {new: true});
    res.json(seller);
  } catch (error) {
    console.error('Error updating seller details:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});

router.get('/:sellerID', async (req, res) => {
  // get specific seller
  const {sellerID} = req.params;
  try {
    const seller = await Seller.findOne({s_id: sellerID});
    if (!seller) {
      return res.status(404).json({error: 'Seller not found'});
    }
    res.status(200).json(seller);
  } catch (error) {
    console.error('Error retrieving seller items:', error);
    res.status(500).json({error: `'Internal server error', ${error.message}`});
  }
});
router.get('/:sellerID/items', async (req, res) => {
  const {sellerID} = req.params;
  try {
    const items = await Item.find({seller: sellerID, isDraft: false}, 'itemID itemName agriJodVerified price pickupAddresses');
    res.json(items);
  } catch (error) {
    console.error('Error retrieving seller items:', error);
    res.status(500).json({error: `'Internal server error', ${error.message}`});
  }
});

router.get('/:sellerID/items/:itemID', async (req, res) => {
  const {sellerID, itemID} = req.params;
  try {
    const item = await Item.findOne({itemID, seller: sellerID});
    if (!item) {
      return res.status(404).json({error: 'Item not found'});
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

router.put('/:sellerID/items/:itemID', async (req, res) => {
  const {itemID, sellerID} = req.params;
  const updatedFields = req.body;
  try {
    const item = await Item.findOneAndUpdate({itemID, seller: sellerID}, updatedFields, {new: true});
    res.json(item);
  } catch (error) {
    console.error('Error updating item details:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});
router.post('/:sellerID/item/:itemID/ajverified/:agriJodVerified', async (req, res) => {
  const {itemID, agriJodVerified} = req.params;
  try {
    const updatedItem = await Item.findOneAndUpdate({itemID}, {agriJodVerified}, {new: true});
    if (!updatedItem) {
      throw new Error('item not found');
    }
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});
router.put('/:sellerID', async (req, res) => {
  const {sellerID} = req.params;
  const updatedFields = req.body;
  try {
    const seller = await Seller.findOneAndUpdate({s_id: sellerID}, updatedFields, {new: true});
    res.json(seller);
  } catch (error) {
    console.error('Error updating seller details:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});


module.exports = router;
