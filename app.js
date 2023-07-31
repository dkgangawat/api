const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
const {authenticateToken} = require('./middlewares/authenticateToken');
const config = require('./config/config');
app.use(cookieParser());
require('./config/db');
require('dotenv').config();
app.use(cors(
    {
        origin: 'http://localhost:3000',
        credentials: true,
    }
));
app.use(require('./routers/agrijod-actuator'));

app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.use('/seller', authenticateToken, require('./routers/sellerRoute'));
app.use('/item', authenticateToken, require('./routers/generalListing'));
app.use('/buyer', authenticateToken, require('./routers/buyerRoute'));
app.use('/add-to-cart', authenticateToken, require('./routers/addToCart'));
app.use('/transporter', authenticateToken, require('./routers/transportRoute'));
app.use('/admin', require('./routers/admin/admin'));
app.get('/', (req, res) => {
  res.send('Welcome to AgriJod');
});
// app.use('/temp', require('./routers/temp'));


module.exports = app;
