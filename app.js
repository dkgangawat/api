const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
const { authenticateToken } = require('./middlewares/authenticateToken');

require('./config/db');
require('dotenv').config();
app.use(cors());
app.use(require('./routers/agrijod-actuator'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/seller', authenticateToken, require('./routers/sellerRoute'));
app.use('/item', authenticateToken, require('./routers/generalListing'));
app.use('/buyer', authenticateToken, require('./routers/buyerRoute'));
app.use('/add-to-cart', authenticateToken, require('./routers/addToCart'));
app.use('/transporter', authenticateToken, require('./routers/transportRoute'))
app.use('/admin', require('./routers/admin/admin'))




module.exports = app;