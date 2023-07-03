const express = require('express');
const admin = express();

admin.use('/sellers', require('./sellerManagement'));
admin.use('/agrijod-verification', require('./agrijodVerification'));
admin.use('/item-management', require('./itemManagement'));
admin.use('/order-management', require('./orderManagement'));
admin.use('/buyers', require('./buyerManagement'));

module.exports = admin;
