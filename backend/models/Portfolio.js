const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    totalValue: {
      type: Number,
      default: 0,
    },
    totalInvested: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

portfolioSchema.index({ user: 1, name: 1 }, { unique: true });
portfolioSchema.set('toJSON', { virtuals: true });
portfolioSchema.set('toObject', { virtuals: true });

portfolioSchema.virtual('holdings', {
  ref: 'Holding',
  localField: '_id',
  foreignField: 'portfolio',
});

module.exports = mongoose.model('Portfolio', portfolioSchema);

