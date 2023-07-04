const express = require('express')
const Order = require('../../models/orderSchema')
const Buyer = require('../../models/buyerSchema')
const Item = require('../../models/ItemListing')
const Seller = require('../../models/seller')
const router = new express.Router()

router.get('/', async(req, res) => {
    try {
        const orders = await Order.find().populate('itemRef')
        const ordersDetails = orders.map((order) => {
            let shippingOpted = {
                pickUpPoint: order.itemRef ? order.itemRef.pickupAddresses : '',
                pickUpPincode: order.itemRef ? order.itemRef.pinCode : ''
            };
            if (order.wantShipping) {
                shippingOpted = {
                    ...shippingOpted,
                    shippingOpted: 'Yes',
                    transporterID: order.transporter?.transporterId,
                    vehicleId: order.transporter?.vehicleId,
                    numberOfVehicle: order.transporter?.numberOfVehicle
                }
            } else {
                shippingOpted = {
                    shippingOpted: 'No',
                    ...shippingOpted
                }
            }
            let grossAmount = {
                productCost: order.productCost,
                shippingCost: order.shippingCost,
            }
            let humaraHissa = order.status==='Item Canceled'? 0:{
                productCost: order.productCost * 0.02,
                shippingCost: order.shippingCost * 0.01,
            }
            return ({
                orderID: order.orderID,
                transactionID: " ",
                shippingOpted,
                status: order.status,
                grossAmount,
                humaraHissa
            })
        })
        res.status(200).json(ordersDetails)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.get('/:orderID/details', async(req, res) => {
    try {
        const { orderID } = req.params
        const order = await Order.findOne({ orderID })
        if (!order) {
            throw new Error('invalid order id')
        }
        const buyer = await Buyer.findOne({ b_id: order.buyerID }, 'fullName phone email bankDetails billingAddress')
        const item = await Item.findOne({ itemID: order.itemID })
        const seller = await Seller.findOne({ s_id: item.seller }, 's_id phone email bankDetails currentAddress')
        res.status(200).json({ buyer, item: { seller, orderSize: order.orderSize, itemID: order.itemID } })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

module.exports = router