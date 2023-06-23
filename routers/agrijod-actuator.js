const actuator = require('express-actuator');
const mongoose = require('mongoose');

const options = {
  basePath: '/actuator',
  customEndpoints: [
    {
      id: 'health/deep',
      controller: (_, res) => {
        const dbHealth = !!mongoose.connection.readyState;
        const servicesHealth = true;
        const status = dbHealth && servicesHealth ? 200 : 503;
        res.status(status).json({
          'status': 'UP',
          'database': status ? 'UP' : 'DOWN',
        });
      },
    },
  ],
};

module.exports = actuator(options);
