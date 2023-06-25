const Item = require("../models/ItemListing");
const Order = require("../models/orderSchema");


const updateTotalStocks = async(orderID) => {
    try {
        const order = await Order.findOne({ orderID })
        const item = await Item.findOne({ itemID: order.itemID });
        if (!item) {
            return { success: false, error: 'item not found' };
        }
        item.totalStock = item.totalStock - order.orderSize
        await item.save();

        return { success: true, message: 'total stocks updated' };
    } catch (error) {
        console.error('Error updating :', error);
        return { success: false, error: 'Internal server error' };
    }
};
module.exports = { updateTotalStocks }