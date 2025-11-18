const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
        default: null
    },
    symbol: {
        type: String,
        required: true,
        uppercase: true
    },
    price: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    source: {
        type: String,
        default: 'manual'
    }
});

priceHistorySchema.index({ user: 1, symbol: 1, timestamp: -1 });

module.exports = mongoose.model('PriceHistory', priceHistorySchema);
