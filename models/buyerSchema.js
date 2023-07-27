const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const {generateBuyerID} = require('../helper/generateUniqueId');
const regex = require('../helper/regex');

const buyerSchema = new mongoose.Schema({
  b_id: {
    type: String,
    unique: true,
    immutable: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    match: regex.phone,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: regex.email,
  },
  state: {
    type: String,
    required: true,
    immutable: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullName: String,
  category: String,
  dateOfBitrth: Date,
  establishmentYear: String,
  billingAddress: String,
  bankDetails: {
    accountNumber: {
      type: String,
      match: regex.bankAccountNumber,
    },
    ifscCode: {
      type: String,
      match: regex.ifscCode,
    },
  },
  identity: {
    idDocument: String,
    idNumber: String,
  },
  currentAddress: String,
});

// generating a buyer id
buyerSchema.pre('save', async function(next) {
  if (this.isNew) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);
    this.password = hashedPassword;
    if (!this.b_id) {
      this.b_id = generateBuyerID(this.state);
    }
  }
  next();
});

const Buyer = mongoose.model('Buyer', buyerSchema);

module.exports = Buyer;
