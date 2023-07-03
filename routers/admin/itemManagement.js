const express = require('express');
const Item = require('../../models/ItemListing');
const router = new express.Router();

router.get('/', async (req, res) => {
  try {
    const items = await Item.find({}, 'itemID itemName seller agriJodVerified bagSize totalStock price');
    if (!items) {
      throw new Error('no items found');
    }
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

module.exports = router;
