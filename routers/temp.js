const axios = require('axios');
const express = require('express');
const { encodeRequest, generateSignature } = require('../helper/pay');
const path = require('path');
const router = express.Router();


// const payload = {
//   merchantId: 'MERCHANTUAT',
//   merchantTransactionId: 'MT7850590068188104',
//   merchantUserId: 'MUID123',
//   amount: 100 ,
//   redirectUrl: 'http://localhost:8000/pay',
//   redirectMode: 'POST',
//   callbackUrl: 'http://localhost:8000/callback',
//   mobileNumber: '9999999999',
//   paymentInstrument: {
//     type: 'PAY_PAGE'
//   }
// };

// router.post('/pay', async (req, res) => {
//   try {
//     const data = encodeRequest(payload)
//     const sign = data+'/pg/v1/pay'+'099eb0cd-02cf-4e2a-8aca-3e6c6aff0399'
//     const XVerify = generateSignature(sign)+'###'+'1'
//     console.log({data,sign, XVerify})
//     const options = {
//         method: 'POST',
//         url: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay',
//         headers: {
//           accept: 'application/json',
//           'Content-Type': 'application/json',
//           'X-VERIFY': XVerify
//         },
//         data: {request: data}
//       };

//     const response = await axios.request(options);
//     console.log(response.data);
//     res.status(200).send(response.data);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send(error);
//   }
// });

router.get('/login', (req, res)=>{
  res.sendFile(path.join(__dirname,'..','temp', 'index.html'))
})
router.get('/addtocart', (req, res)=>{
  res.sendFile(path.join(__dirname,'..','temp', 'addtocart.html'))
})
router.post('/payment-redirect', (req, res)=>{
  res.sendFile(path.join(__dirname,'..','temp', 'paymentStatus.html'))
})

module.exports = router;
