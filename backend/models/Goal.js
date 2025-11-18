const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    deadline: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      default: null,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

goalSchema.index({ user: 1, status: 1 });
goalSchema.index({ user: 1, deadline: 1 });

module.exports = mongoose.model('Goal', goalSchema);


