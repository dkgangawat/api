const express = require("express");
const router = new express.Router();
const Item = require("../models/ItemListing");
const Order = require("../models/orderSchema");
const Buyer = require("../models/buyerSchema");
const transportAlgo = require("../helper/transportAlgo");
const getPincodeDistance = require("../helper/getPincodeDistance");
const Vehicle = require("../models/VehicleSchema");
const { cancelOrderIfPaymentNotCompleted } = require("../helper/cancelOrderIfPaymentNotCompleted");
const { encodeRequest, generateSignature, decodeResponse } = require("../helper/pay");
const { default: axios } = require("axios");
const Payment = require("../models/paymentSchema");
const config = require("../config/config");
const { generateTransectionId, generateOrderID } = require("../helper/generateUniqueId");

let transportAlgoResult;

router.get("/", async (req, res) => {
  try {
    const { itemID, orderSize, wantShipping, dropoffLocation } = req.body;

    const item = await Item.findOne({ itemID });

    if (!item) {
      throw new Error("invalid item id");
    }
    const productCost = item.price * orderSize * item.bagSize;

    // Calculate shipping cost
    let shippingCost = 0;
  
    if (wantShipping && dropoffLocation) {
      if (!transportAlgoResult) {
        return res.status(404).json({ message: "Transport algo not executed" });
      }
      const vehicle = await Vehicle.findOne({
        vehicleId: transportAlgoResult.vehicleId,
      });
      shippingCost =
        ((await getPincodeDistance(vehicle.hubPinCode, item.pinCode)) +
          (await getPincodeDistance(item.pinCode, dropoffLocation))) *
          vehicle.ratePerKm *
          transportAlgoResult.numberOfVehicle +
        transportAlgoResult.numberOfVehicle * vehicle.loadingCharges;
    }
    const {
      itemDescription,
      price,
      bagSize,
      minOrderAmount,
      totalStock,
      pinCode,
    } = item;
    const addToCartViewField = {
      itemID,
      itemDescription,
      price,
      bagSize,
      minOrderAmount,
      totalStock,
      pinCode: !wantShipping ? pinCode:"",
      productCost,
      shippingCost,
      totalCost: productCost + shippingCost
    };
    res.status(200).json(addToCartViewField);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/transport-algo", async (req, res) => {
  try {
    const { itemID, orderSize, dropoffLocation } = req.body;
    const item = await Item.findOne({ itemID });
    if (!item) {
      return res.status(404).json({ message: "item not found" });
    }
    const algoresult = await transportAlgo(
      item.pinCode,
      orderSize,
      dropoffLocation,
      item.bagSize
    );
    if (
      !algoresult.efficientVehicle ||
      !algoresult.efficientTransporter ||
      !algoresult.numberOfvehicles
    ) {
      transportAlgoResult= null
      return res
        .status(404)
        .json({ message: "transporter not avilabel right now on this route" });
    }
    transportAlgoResult = {
      transporterId: algoresult.efficientTransporter,
      vehicleId: algoresult.efficientVehicle.vehicleId,
      numberOfVehicle: algoresult.numberOfvehicles,
    };
    res.status(200).json({ result: algoresult });
  } catch (error) {
    console.error("Error executing transport algorithm:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { itemID, orderSize, wantShipping, dropoffLocation } = req.body;

    // Fetch item details from the provided Item ID
    const item = await Item.findOne({ itemID });
    if (item.minOrderAmount <= orderSize && orderSize <= item.totalStock) {
      const sellerID = item.seller;
      const buyerID = req.userId;
      const buyer = await Buyer.findOne({ b_id: buyerID });
      const buyerState = buyer.state;
      // Calculate product cost
      const productCost = item.price * orderSize*item.bagSize;
      const orderID = generateOrderID(buyerState)
      const merchantTransactionId= generateTransectionId()
      // Calculate shipping cost
      let shippingCost = 0;
      if (wantShipping && dropoffLocation) {
        if (!transportAlgoResult) {
          return res
            .status(404)
            .json({ message: "Transport algo not executed or transporter not avilabel right now on this route" });
        }
        const vehicle = await Vehicle.findOne({
          vehicleId: transportAlgoResult.vehicleId,
        });
        shippingCost =
          ((await getPincodeDistance(vehicle.hubPinCode, item.pinCode)) +
            (await getPincodeDistance(item.pinCode, dropoffLocation))) *
            vehicle.ratePerKm *
            transportAlgoResult.numberOfVehicle +
          transportAlgoResult.numberOfVehicle * vehicle.loadingCharges;
      }

      // Calculate total cost
      const totalCost = productCost + shippingCost;
      // payment initialisation 
      const payload = {
        merchantId: config.MERCHANT_ID,
        merchantTransactionId,
        merchantUserId: buyerID,
        merchantOrderId: orderID,
        amount: totalCost*100,
        redirectUrl: 'http://16.170.219.8:8000/add-to-cart/payment/redirect',
        redirectMode: 'POST',
        callbackUrl: 'http://16.170.219.8:8000/add-to-cart/payment/callback',
        mobileNumber: buyer.phone,
        paymentInstrument: {
          type: 'PAY_PAGE'
        }
      };
      const base64 = encodeRequest(payload)
      const sign = `${base64}/pg/v1/pay${config.MERCHANT_KEY}`
      const XVerify = generateSignature(sign)+'###'+'1'
      const options = {
          method: 'POST',
          url: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay',
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': XVerify
          },
          data: {request: base64}
        };
  
      const response = await axios.request(options);
      // Save the order details in the database
      let order = new Order({
        orderID,
        itemID,
        itemRef: item._id,
        buyerRef: buyer._id,
        sellerID,
        buyerID,
        buyerState,
        orderSize,
        wantShipping,
        dropoffLocation,
        productCost,
        shippingCost,
        totalCost,
        transporter: transportAlgoResult,
        paymentStatus: "initiated",
      });
      const newOrder = await order.save();
      const payment = new Payment(
        {
          buyerID:buyerID,
          mobileNumber:buyer.phone,
          amount:totalCost,
          agrijodTxnID:merchantTransactionId,
          orderID:orderID,
          txnState:"initiated"
        }
      )
      await payment.save()
      setTimeout(async () => {
        await cancelOrderIfPaymentNotCompleted(newOrder.orderID);
      }, 8 * 60 * 60 * 1000)
      transportAlgoResult=null
      res.json({ orderID: newOrder.orderID, newOrder,payment:response.data});
    } else {
      res
        .status(404)
        .json({
          message:
            "order size should be greater than or equal to min order size and less then equal to toal stock ",
        });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Payment route
router.post("/payment", async (req, res) => {
  try {
    // const { orderID, paymentStatus } = req.body;
    // console.log(orderID);
    // if (!orderID || !paymentStatus) {
    //   res.status(404).json({ message: "not found" });
    // }
    // const updatedOrder = await Order.findOneAndUpdate(
    //   { orderID },
    //   { paymentStatus },
    //   { new: true }
    // );
    
    // await updateOrderStatus(orderID, "Waiting for seller");
    // res.json({ message: "Payment successful", updatedOrder });
    const callbackResponse = req.body;
    console.log(callbackResponse);
    res.status(200).json({ message: "Payment successful" ,callbackResponse});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Payment redirect route
router.post('/payment/redirect', async (req, res) => {
  try {
    const data = req.body;
    res.json(data);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" ,message:error.message});
  }
})

router.post('/payment/callback', async (req, res) => {
  try {
    const response = req.body.response;
    const callbackResponse = decodeResponse(response)
    const {merchantTransactionId,transactionId,amount,paymentInstrument,state} = callbackResponse.data
    const payment = await Payment.findOne({agrijodTxnID:merchantTransactionId})
      payment.amount=amount
      payment.paymentInstrument= paymentInstrument
      payment.txnID=transactionId
      payment.txnState=state
      await payment.save();
    if(state==='COMPLETED'){
      await Order.findOneAndUpdate(
      { orderID:payment.orderID },
      { paymentStatus: 'completed'}
    );
    await updateOrderStatus(payment.orderID, "Waiting for seller");
    }
    res.status(200).json({ message: 'Payment recorded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
