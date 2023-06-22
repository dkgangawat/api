const mongoose = require('mongoose');
require("dotenv").config();
const { MONGO_URI } = require('./config')
mongoose.connect(`${MONGO_URI}/agrijod`, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Failed to connect to MongoDB', error);
    });