const express = require('express');
const admin = express();

admin.use('/sellers', require('./sellerManagement'));
admin.use('/agrijod-verification', require('./agrijodVerification'));
admin.use('/item-management', require('./itemManagement'));
admin.use('/order-management', require('./orderManagement'));
admin.use('/buyers', require('./buyerManagement'));
admin.use('/transporter-management', require('./transporterManagement'));
admin.use('/refunds', require('./refunds'));
admin.use('/payments', require('./paymentManagement'));
admin.use('/payout', require('./payout'));

module.exports = admin;
