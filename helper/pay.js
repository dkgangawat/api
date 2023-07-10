const crypto = require('crypto');
const config = require('../config/config');
const { default: axios } = require('axios');

function encodeRequest(payload) {
    return Buffer.from(JSON.stringify(payload)).toString("base64");
  }

function generateSignature(payload) {
    return crypto
    .createHash("sha256")
    .update(payload)
    .digest("hex");
}

async function checkStatus(transactionId) {
  const sign = `/pg/v1/status/${config.MERCHANT_ID}/${transactionId}${config.MERCHANT_KEY}`;
  const XVerify = generateSignature(sign) + "###" + "1";
  const options = {
    method: "GET",
    url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${config.MERCHANT_ID}/${transactionId}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": XVerify,
      "X-MERCHANT-ID": data.merchantId,
    },
  };
  const response = await axios.request(options);
  return response.data;
}

function getInterval() {
    const intervals = [
      [20, 25],
      [3, 30],
      [6, 60],
      [10, 60],
      [30, 60],
      [60, 60],
      [60, 99999] // Last interval, continues every 1 minute until timeout
    ];
  
    let intervalIndex = 0;
    let intervalDuration = intervals[intervalIndex][0] * 1000;
  
    return () => {
      const [duration, limit] = intervals[intervalIndex];
      intervalDuration = duration * 1000;
      intervalIndex = intervalIndex + 1 < intervals.length ? intervalIndex + 1 : intervals.length - 1;
      return intervalDuration;
    };
  }

module.exports = {
    encodeRequest,
    generateSignature,
    checkStatus,
    getInterval
}