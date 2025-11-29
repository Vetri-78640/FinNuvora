const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'],
      trim: true,
    },
    accountBalance: {
      type: Number,
      default: 0,
    },
    monthlyLimit: {
      type: Number,
      default: 600, // Default ~$50,000 INR
    },
    plaidAccessToken: {
      type: String,
      default: null,
    },
    plaidItemId: {
      type: String,
      default: null,
    },
    profilePicture: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);


