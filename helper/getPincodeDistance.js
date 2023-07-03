const axios = require('axios');
const {GOOGLE_MAP_KEY} = require('../config/config');
// Route to calculate distance between two pin codes
const getPincodeDistance = async (origin, destination) => {
  const response = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_MAP_KEY}`,
  );
  return Math.ceil(response.data.routes[0].legs[0].distance.value / 100);
};

module.exports = getPincodeDistance;
