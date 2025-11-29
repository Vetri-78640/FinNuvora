const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense', 'investment'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    source: {
      type: String,
      enum: ['bank_statement', 'manual', 'bank_statement_ai', 'smart_add'],
      default: 'manual',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1 });
transactionSchema.index({ description: 'text' });

module.exports = mongoose.model('Transaction', transactionSchema);


