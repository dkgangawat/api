const mongoose = require('mongoose');

const agriJodVerificationRequestSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true,
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  certification: {
    type: String,
    required: true,
  },
  itemImages: [{
    type: String,
    required: true,
  }],
  comments: String,
  requestId: {
    type: String,
    unique: true,
    required: true,
  },
  isActive:{
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
agriJodVerificationRequestSchema.pre('find', function(next) {
  this.populate('seller').populate('item');
  next();
});

// Pre middleware for findOne operation
agriJodVerificationRequestSchema.pre('findOne', function(next) {
  this.populate('seller').populate('item');
  next();
});

const AgriJodVerificationRequest = mongoose.model('AgriJodVerificationRequest', agriJodVerificationRequestSchema);

module.exports = AgriJodVerificationRequest;
