const Order = require("../models/orderSchema");


const updateOrderStatus = async(orderId, status, sellerVerified = 'pending') => {
    try {
        const order = await Order.findOne({ orderID: orderId });
        if (!order) {
            return { success: false, error: 'Order not found' };
        }
        if (order.sellerVerified !== 'pending') {
            return
        }
        order.status = status;
        order.sellerVerified = sellerVerified;
        await order.save();

        return { success: true, message: 'Order status updated successfully' };
    } catch (error) {
        console.error('Error updating order status:', error);
        return { success: false, error: 'Internal server error' };
    }
};
module.exports = { updateOrderStatus }