const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        sparse: true
    },
    theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
    },
    notifications: {
        priceAlert: {
                type: Boolean,
                default: true
            },
        portfolioUpdate: {
                type: Boolean,
                default: true
            }
    },
    currency: {
        type: String,
        default: 'USD'
    },
    language: {
        type: String,
        default: 'en'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('UserPreferences', userPreferencesSchema);
