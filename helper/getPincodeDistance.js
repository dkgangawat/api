const axios = require('axios');
const config = require('../config/config');
// Route to calculate distance between two pin codes
const getPincodeDistance = async (origin, destination) => {
  const response = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${config.GOOGLE_MAP_KEY}`,
  );
  return Math.ceil(response.data.routes[0].legs[0].distance.value / 1000);
};

module.exports = getPincodeDistance;
