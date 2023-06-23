const express = require('express');
const cors = require('cors');
const app = express();

require('./config/db');
require('dotenv').config();

app.use(cors());
app.use(require('./routers/agrijod-actuator'));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

apKp.use('/seller', require('./routers/sellerRoute'));
app.use('/item', require('./routers/GeneralListing'));
app.use('/buyer', require('./routers/buyerRoute'));
app.use('/add-to-cart', require('./routers/addToCart'));

module.exports = app;
