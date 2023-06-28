const Order = require("../models/orderSchema");


const updateRefundStatus = async(orderId, refundStatus) => {
    try {
        const order = await Order.findOne({ orderID: orderId });
        if (!order) {
            return { success: false, error: 'Order not found' };
        }
        order.refundStatus = refundStatus
        await order.save();

        return { success: true, message: 'refund status updated successfully' };
    } catch (error) {
        console.error('Error updating refund status:', error);
        return { success: false, error: 'Internal server error' };
    }
};
module.exports = { updateRefundStatus }