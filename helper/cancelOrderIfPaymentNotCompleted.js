const Order = require('../models/orderSchema');
const {addToRefundTable} = require('./addToRefundTable');
const {updateRefundStatus} = require('./updateRefundStatus');

const cancelOrderIfPaymentNotCompleted = async (orderID) => {
  try {
    const order = await Order.findOne({orderID});

    if (!order) {
      throw new Error('Invalid order ID');
    }

    if (order.paymentStatus !== 'completed') {
      order.shippingCost=0;
      order.productCost=0;
      order.totalCost=0;
      order.status = 'Item Canceled';
      await order.save();
      await addToRefundTable(order.orderID);
      await updateRefundStatus(order.orderID, 'processing');
      return `Order ${orderID} has been cancelled.`;
    }
  } catch (error) {
    return `Error cancelling order ${orderID}: ${error.message}`;
  }
};

module.exports = {cancelOrderIfPaymentNotCompleted};
