
const Refund = require('../models/refundSchema');


const updateRefundStatus = async (orderId, refundStatus) => {
  try {
    const refund = await Refund.findOne({refundID: orderId});
    if (!refund) {
      return {success: false, error: 'Order not found'};
    }
    refund.refundStatus = refundStatus;
    await refund.save();

    return {success: true, message: 'refund status updated successfully'};
  } catch (error) {
    console.error('Error updating refund status:', error);
    return {success: false, error: 'Internal server error'};
  }
};
module.exports = {updateRefundStatus};
