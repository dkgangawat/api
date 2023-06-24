const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');

require('./config/db');
require('dotenv').config();

app.use(cors());
app.use(require('./routers/agrijod-actuator'));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use('/seller', require('./routers/sellerRoute'));
app.use('/item', require('./routers/generalListing'));
app.use('/buyer', require('./routers/buyerRoute'));
app.use('/add-to-cart', require('./routers/addToCart'));
app.use('/transporter', require('./routers/transportRoute'));

module.exports = app;
