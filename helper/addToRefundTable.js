const Order = require("../models/orderSchema");
const Refund = require("../models/refundSchema");

const addToRefundTable = async (orderID) => {
  try {
    const order = await Order.findOne({ orderID });
    if (!order) {
      throw new Error("invalid order id");
    }
    const refund = new Refund({
      refundID: orderID,
      order: order._id,
      buyerID: order.buyerID,
      productRefundAmount:order.productCost,
      shippingRefundAmount:order.shippingCost,
      amountToBeRefunded: order.totalCost,
    });
    await refund.save();
  } catch (error) {
    console.error("Error adding to refund table:", error);
  }
};


module.exports = {addToRefundTable};
