const PaymentRequest = require('../models/PaymentRequest');
const User = require('../models/User');
const mongoose = require('mongoose');

// GET /api/payments — all requests involving this user
exports.getRequests = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const userObjectId = new mongoose.Types.ObjectId(req.userId);

        const requests = await PaymentRequest.find({
            $or: [
                { fromUserId: userObjectId },
                { toEmail: user.email },
            ],
        }).sort({ createdAt: -1 });

        // Categorize as sent or received
        const sent = requests.filter(r => r.fromUserId.toString() === req.userId);
        const received = requests.filter(r => r.toEmail === user.email && r.fromUserId.toString() !== req.userId);

        res.json({ success: true, data: { sent, received } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// POST /api/payments — send a payment request
exports.createRequest = async (req, res) => {
    try {
        const { toEmail, amount, description } = req.body;
        if (!toEmail || !amount) {
            return res.status(400).json({ success: false, error: 'Email and amount are required' });
        }

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        if (toEmail.toLowerCase() === user.email) {
            return res.status(400).json({ success: false, error: "You can't send a request to yourself" });
        }

        // Check if recipient exists
        const recipient = await User.findOne({ email: toEmail.toLowerCase() });

        const request = await PaymentRequest.create({
            fromUserId: req.userId,
            fromUserName: user.name,
            toEmail: toEmail.toLowerCase(),
            toUserId: recipient?._id || null,
            amount: Number(amount),
            description: description || '',
        });

        res.status(201).json({ success: true, data: request });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// PATCH /api/payments/:id — accept or decline
exports.respondToRequest = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['accepted', 'declined'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Status must be accepted or declined' });
        }

        const user = await User.findById(req.userId);
        const request = await PaymentRequest.findById(req.params.id);

        if (!request) return res.status(404).json({ success: false, error: 'Request not found' });
        if (request.toEmail !== user.email) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }
        if (request.status !== 'pending') {
            return res.status(400).json({ success: false, error: 'Request already responded to' });
        }

        request.status = status;
        await request.save();

        res.json({ success: true, data: request });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
