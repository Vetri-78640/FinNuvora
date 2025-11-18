const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema(
  {
    portfolio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Portfolio',
      required: true,
      index: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    buyPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    currentPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    purchaseDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

holdingSchema.index({ portfolio: 1, symbol: 1 });
holdingSchema.set('toJSON', { virtuals: true });
holdingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Holding', holdingSchema);

