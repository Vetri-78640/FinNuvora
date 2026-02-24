const mongoose = require('mongoose');

const paymentRequestSchema = new mongoose.Schema(
    {
        fromUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        fromUserName: {
            type: String,
            required: true,
        },
        toEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        toUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        amount: {
            type: Number,
            required: true,
            min: 0.01,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 200,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'declined'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

paymentRequestSchema.index({ fromUserId: 1 });
paymentRequestSchema.index({ toUserId: 1 });
paymentRequestSchema.index({ toEmail: 1 });

module.exports = mongoose.model('PaymentRequest', paymentRequestSchema);
