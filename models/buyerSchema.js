const mongoose = require('mongoose')
const bcrypt = require('bcrypt');

const buyerSchema = new mongoose.Schema({
    b_id: {
        type: String,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    state: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    fullName: String,
    category: String,
    dateOfBirth: Date,
    establishmentYear: String,
    billingAddress: String,

});

//generating a buyer id 
buyerSchema.pre('save', async function(next) {
    if (this.isNew) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(this.password, saltRounds);
        this.password = hashedPassword;
        if (!this.b_id) {
            const stateInitials = this.state.toUpperCase().replace(/\s+/g, '').substring(0, 2);
            const randomId = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random number
            this.b_id = `B-${stateInitials}-${randomId}`;
        }
    }
    next();
});

const Buyer = mongoose.model('Buyer', buyerSchema);

module.exports = Buyer;