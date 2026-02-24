const User = require('../models/User');

// GET /api/subscription — get current plan
exports.getSubscription = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        res.json({
            success: true,
            data: {
                plan: user.subscription?.plan || 'free',
                status: user.subscription?.status || 'active',
                currentPeriodEnd: user.subscription?.currentPeriodEnd || null,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// POST /api/subscription/checkout — create checkout session (placeholder)
exports.createCheckoutSession = async (req, res) => {
    try {
        const { plan } = req.body;
        if (!['pro', 'business'].includes(plan)) {
            return res.status(400).json({ success: false, error: 'Invalid plan' });
        }

        // Placeholder — In production, create a Stripe checkout session
        const hasStripe = process.env.STRIPE_SECRET_KEY;

        if (hasStripe) {
            const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

            const prices = {
                pro: process.env.STRIPE_PRO_PRICE_ID,
                business: process.env.STRIPE_BUSINESS_PRICE_ID,
            };

            const session = await stripe.checkout.sessions.create({
                mode: 'subscription',
                payment_method_types: ['card'],
                line_items: [{ price: prices[plan], quantity: 1 }],
                success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/billing?success=true`,
                cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pricing`,
                client_reference_id: req.userId,
            });

            return res.json({ success: true, url: session.url });
        }

        // No Stripe key — simulate upgrade
        const user = await User.findById(req.userId);
        user.subscription = {
            plan,
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        };
        await user.save();

        res.json({
            success: true,
            url: null,
            simulated: true,
            message: `Upgraded to ${plan} plan (demo mode — no Stripe key configured)`,
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// POST /api/subscription/cancel
exports.cancelSubscription = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        user.subscription = { plan: 'free', status: 'active', currentPeriodEnd: null };
        await user.save();

        res.json({ success: true, message: 'Subscription cancelled' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
