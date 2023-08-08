const express = require('express');
const AgriJodVerificationRequest = require('../../models/agriJodVerificationRequestSchema');
const Item = require('../../models/ItemListing');
const {deleteAJVR} = require('../../helper/deleteAJVR');
const router = new express.Router();

router.get('/', async (req, res) => {
  try {
    const requests = await AgriJodVerificationRequest.find({isActive: true});
    res.json(requests);
  } catch (error) {
    console.error('Error retrieving verification details:', error);
    res.status(500).json({error: 'Internal server error'});
  }
});
router.post('/request/:requestId/:action', async (req, res) => {
  const {requestId, action} = req.params;
  try {
    if (action !== 'accept' && action !== 'reject') throw new Error('action must be either accept or reject');
    const request = await AgriJodVerificationRequest.findOne({requestId, isActive: true});
    if (!request) {
      return res.status(404).json({error: 'agrijod verification request not found'});
    }
    if (action == 'reject') {
      await deleteAJVR(requestId);
    } else if (action == 'accept') {
      const item = await Item.findOne({itemID: request.item.itemID});
      item.agriJodVerified = true;
      await item.save();
      await deleteAJVR(requestId);
    } else {
      res.status(404).json({message: 'action must be accept or reject'});
    }
    res.json({message: `request ${action}`});
  } catch (error) {
    console.error('Error updating verification action:', error);
    res.status(500).json({error: error.message});
  }
});


module.exports = router;
