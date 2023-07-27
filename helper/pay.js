const crypto = require('crypto');
const config = require('../config/config');
const {default: axios} = require('axios');

/**
 * Encode the request payload.
 * @param {Object} payload - The payload to encode.
 * @return {string} The encoded payload.
 */
function encodeRequest(payload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}
const decodeResponse =(encodedPayload)=>{
  const decodedPayload = Buffer.from(encodedPayload, 'base64').toString('utf-8');
  return JSON.parse(decodedPayload);
};
/**
 * Generate the signature for the payload.
 * @param {string} payload - The payload to generate the signature for.
 * @return {string} The generated signature.
 */
function generateSignature(payload) {
  return crypto
      .createHash('sha256')
      .update(payload)
      .digest('hex');
}

/**
 * Check the status of a transaction.
 * @param {string} transactionId - The transaction ID to check the status for.
 * @return {Promise<Object>} The response data containing the status.
 */
async function checkStatus(transactionId) {
  const sign = `/pg/v1/status/${config.MERCHANT_ID}/${transactionId}${config.MERCHANT_KEY}`;
  const XVerify = generateSignature(sign) + '###' + '1';
  const options = {
    method: "GET",
    url: `${config.PHONEPE_BASE_URL}/pg/v1/status/${config.MERCHANT_ID}/${transactionId}`,
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'X-VERIFY': XVerify,
      'X-MERCHANT-ID': config.MERCHANT_ID,
    },
  };
  const response = await axios.request(options);
  return response.data;
}

/**
 * Get the interval duration for the status check.
 * @return {Function} The function to get the next interval duration.
 */
function getInterval() {
  const intervals = [
    [20, 25],
    [3, 30],
    [6, 60],
    [10, 60],
    [30, 60],
    [60, 60],
    [60, 99999], // Last interval, continues every 1 minute until timeout
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
  getInterval,
  decodeResponse,
};
