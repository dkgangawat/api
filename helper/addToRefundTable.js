const Order = require('../models/orderSchema');
const Refund = require('../models/refundSchema');

const addToRefundTable = async (orderID) => {
  try {
    const order = await Order.findOne({orderID});
    if (!order) {
      throw new Error('invalid order id');
    }
    let amountToBeRefunded =0;
    let shippingRefundAmount =0;
    let productRefundAmount =0;
    if (order.status =='Item Canceled') {
      productRefundAmount=order.productCost;
      shippingRefundAmount=order.shippingCost;
      amountToBeRefunded= order.totalCost;
    }
    const refund = new Refund({
      refundID: orderID,
      order: order._id,
      buyerID: order.buyerID,
      productRefundAmount,
      shippingRefundAmount,
      amountToBeRefunded,
    });
    await refund.save();
  } catch (error) {
    console.error('Error adding to refund table:', error);
  }
};


module.exports = {addToRefundTable};
