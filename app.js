const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
const {authenticateToken} = require('./middlewares/authenticateToken');
const config = require('./config/config');
const { performPendingTasks } = require('./helper/performPendingTasks');
const { startPaymentCancleCornJob } = require('./helper/cronJobToCanclePayment');
const { adminAuth } = require('./middlewares/adminAuth');

app.use(cookieParser());
require('./config/db');
require('dotenv').config();
performPendingTasks();
startPaymentCancleCornJob();
app.use(cors(
    {
        origin: '*',
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
app.use('/admin',adminAuth, require('./routers/admin/admin'));
app.get('/', (req, res) => {
  res.send('Welcome to AgriJod');
});
// app.use('/temp', require('./routers/temp'));


module.exports = app;
