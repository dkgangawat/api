const AgriJodVerificationRequest = require('../models/agriJodVerificationRequestSchema');


const deleteAJVR = async (requestId) => {
  try {
    const deletedRequest = await AgriJodVerificationRequest.findOne({requestId});
    deletedRequest.isActive = false;
    await deletedRequest.save();
    if (!deletedRequest) {
      return {success: false, error: 'Verification request not found'};
    }
    return {success: true, message: 'Verification request deleted successfully'};
  } catch (error) {
    return {success: false, error: error.message};
  }
};

module.exports = {deleteAJVR};
