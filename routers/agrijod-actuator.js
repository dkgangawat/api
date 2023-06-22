const actuator = require('express-actuator');
const mongoose = require('mongoose');

const options = {
  customEndpoints: [
    {
      id: 'health',
      controller: (req, res) => {
        res.status(200).send('OK');
      },
    },
    {
      id: 'deep-health',
      controller: (req, res) => {
        const dbHealth = !!mongoose.connection.readyState;
        const servicesHealth = true;
        const status = dbHealth && servicesHealth ? 200 : 503;
        res.status(status).json({
          'server': 'OK',
          'database': newLocal ? 'OK' : 'NOT OK',
        });
      },
    },
  ],
};

module.exports = actuator(options);
