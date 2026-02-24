const CryptoHolding = require('../models/CryptoHolding');

// CoinGecko free API base
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// GET /api/crypto/holdings
exports.getHoldings = async (req, res) => {
    try {
        const holdings = await CryptoHolding.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json({ success: true, data: holdings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// POST /api/crypto/holdings
exports.addHolding = async (req, res) => {
    try {
        const { coinId, symbol, name, quantity, avgBuyPrice } = req.body;
        if (!coinId || !symbol || !name || !quantity || !avgBuyPrice) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }

        // Check if user already has this coin — merge if so
        const existing = await CryptoHolding.findOne({ userId: req.userId, coinId });
        if (existing) {
            const totalQty = existing.quantity + Number(quantity);
            const totalCost = (existing.quantity * existing.avgBuyPrice) + (Number(quantity) * Number(avgBuyPrice));
            existing.quantity = totalQty;
            existing.avgBuyPrice = totalCost / totalQty;
            await existing.save();
            return res.json({ success: true, data: existing });
        }

        const holding = await CryptoHolding.create({
            userId: req.userId,
            coinId,
            symbol: symbol.toUpperCase(),
            name,
            quantity: Number(quantity),
            avgBuyPrice: Number(avgBuyPrice),
        });

        res.status(201).json({ success: true, data: holding });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// PUT /api/crypto/holdings/:id
exports.updateHolding = async (req, res) => {
    try {
        const holding = await CryptoHolding.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { $set: req.body },
            { new: true }
        );
        if (!holding) return res.status(404).json({ success: false, error: 'Holding not found' });
        res.json({ success: true, data: holding });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// DELETE /api/crypto/holdings/:id
exports.deleteHolding = async (req, res) => {
    try {
        const holding = await CryptoHolding.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!holding) return res.status(404).json({ success: false, error: 'Holding not found' });
        res.json({ success: true, data: holding });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET /api/crypto/market?ids=bitcoin,ethereum&vs_currency=usd
exports.getMarketData = async (req, res) => {
    try {
        const { ids, vs_currency = 'usd' } = req.query;
        if (!ids) return res.json({ success: true, data: [] });

        const url = `${COINGECKO_BASE}/coins/markets?vs_currency=${vs_currency}&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=24h,7d`;

        const response = await fetch(url);
        if (!response.ok) {
            // CoinGecko rate limit — return empty gracefully
            return res.json({ success: true, data: [], rateLimited: true });
        }

        const data = await response.json();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET /api/crypto/search?q=bitcoin
exports.searchCoins = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ success: true, data: [] });

        const url = `${COINGECKO_BASE}/search?query=${encodeURIComponent(q)}`;
        const response = await fetch(url);
        if (!response.ok) {
            return res.json({ success: true, data: [], rateLimited: true });
        }

        const result = await response.json();
        const coins = (result.coins || []).slice(0, 15).map(c => ({
            id: c.id,
            name: c.name,
            symbol: c.symbol.toUpperCase(),
            thumb: c.thumb,
            marketCapRank: c.market_cap_rank,
        }));

        res.json({ success: true, data: coins });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
