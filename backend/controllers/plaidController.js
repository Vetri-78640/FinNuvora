const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const { convertToUSD } = require('../utils/currencyUtils');

const configuration = new Configuration({
    basePath: PlaidEnvironments.sandbox, // Default to sandbox
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
            'PLAID-SECRET': process.env.PLAID_SECRET,
        },
    },
});

const client = new PlaidApi(configuration);

// @desc    Create Link Token
// @route   POST /api/plaid/create_link_token
// @access  Private
const createLinkToken = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);

        const request = {
            user: {
                client_user_id: user._id.toString(),
            },
            client_name: 'FinNuvora',
            products: ['transactions'],
            country_codes: ['US'], // Sandbox defaults to US. For real ICICI, add 'IN' if supported or use international
            language: 'en',
        };

        const createTokenResponse = await client.linkTokenCreate(request);
        res.json(createTokenResponse.data);
    } catch (err) {
        console.error('Error creating link token:', err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to create link token' });
    }
};

// @desc    Exchange Public Token for Access Token
// @route   POST /api/plaid/set_access_token
// @access  Private
const setAccessToken = async (req, res, next) => {
    try {
        const { public_token } = req.body;
        const user = await User.findById(req.userId);

        const response = await client.itemPublicTokenExchange({
            public_token,
        });

        const accessToken = response.data.access_token;
        const itemId = response.data.item_id;

        // Save access token to user
        user.plaidAccessToken = accessToken;
        user.plaidItemId = itemId;
        await user.save();

        res.json({ success: true, message: 'Bank connected successfully' });
    } catch (err) {
        console.error('Error exchanging public token:', err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to connect bank' });
    }
};

// @desc    Sync Transactions
// @route   POST /api/plaid/sync_transactions
// @access  Private
const syncTransactions = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);

        if (!user.plaidAccessToken) {
            return res.status(400).json({ error: 'No bank connected' });
        }

        // Fetch transactions (last 30 days for demo)
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        const startString = startDate.toISOString().split('T')[0];
        const endString = new Date().toISOString().split('T')[0];

        const response = await client.transactionsGet({
            access_token: user.plaidAccessToken,
            start_date: startString,
            end_date: endString,
        });

        const transactions = response.data.transactions;
        let addedCount = 0;

        for (const t of transactions) {
            // Check if transaction already exists (simple check by description and date)
            // Ideally store plaid_transaction_id
            const existing = await Transaction.findOne({
                user: user._id,
                date: new Date(t.date),
                amount: Math.abs(t.amount), // Plaid: positive is expense. FinNuvora: expense is positive amount with type 'expense'
                description: t.name
            });

            if (!existing) {
                // Find or create category
                let categoryName = t.category ? t.category[0] : 'General';
                let category = await Category.findOne({ user: user._id, name: categoryName });

                if (!category) {
                    // Try to map to existing categories or create new
                    category = await Category.create({
                        user: user._id,
                        name: categoryName,
                        color: '#94a3b8'
                    });
                }

                // Plaid amount: positive = expense, negative = income
                const type = t.amount >= 0 ? 'expense' : 'income';
                const amount = Math.abs(t.amount); // Store as positive number

                // Convert to USD if needed (Plaid usually returns in account currency)
                // For Sandbox US, it's USD. If user is INR, we might need to convert?
                // Let's assume Plaid returns USD for now in Sandbox.
                // In real world, t.iso_currency_code tells us.

                let finalAmount = amount;
                if (t.iso_currency_code && t.iso_currency_code !== 'USD') {
                    finalAmount = convertToUSD(amount, t.iso_currency_code);
                }

                await Transaction.create({
                    user: user._id,
                    amount: finalAmount,
                    type,
                    category: category._id,
                    description: t.name,
                    date: new Date(t.date)
                });

                // Update balance
                if (type === 'income') {
                    user.accountBalance += finalAmount;
                } else {
                    user.accountBalance -= finalAmount;
                }

                addedCount++;
            }
        }

        await user.save();

        res.json({ success: true, added: addedCount });
    } catch (err) {
        console.error('Error syncing transactions:', err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to sync transactions' });
    }
};

module.exports = {
    createLinkToken,
    setAccessToken,
    syncTransactions
};
