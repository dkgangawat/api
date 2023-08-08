const Vehicle = require('../models/VehicleSchema');
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
      if ( order.wantShipping ===true && order.dropoffLocation) {
            const vehicle = await Vehicle.findOne({
              vehicleId: order.transporter?.vehicleId,
              isActive: true,
            });
            await updateAvailableToday(vehicle.vehicleId, vehicle.availableToday + order.transporter?.numberOfVehicle);
          }
      return `Order ${orderID} has been cancelled.`;
    }
  } catch (error) {
    return `Error cancelling order ${orderID}: ${error.message}`;
  }
};

module.exports = {cancelOrderIfPaymentNotCompleted};
