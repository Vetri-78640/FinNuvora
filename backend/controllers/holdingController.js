const mongoose = require('mongoose');
const Holding = require('../models/Holding');
const Portfolio = require('../models/Portfolio');

const createHolding = async (req, res, next) => {
    try {
        const { portfolioId, symbol, quantity, buyPrice, currentPrice } = req.body;
        const userId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired session. Please login again.'
            });
        }

        if (!portfolioId || !symbol || quantity === undefined || buyPrice === undefined || currentPrice === undefined) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required: portfolioId, symbol, quantity, buyPrice, currentPrice'
            });
        }

        if (quantity <= 0 || buyPrice <= 0 || currentPrice <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Quantity and prices must be positive numbers'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(portfolioId)) {
            return res.status(404).json({
                success: false,
                error: 'Portfolio not found'
            });
        }

        const portfolio = await Portfolio.findById(portfolioId);

        if (!portfolio) {
            return res.status(404).json({
                success: false,
                error: 'Portfolio not found'
            });
        }

        if (portfolio.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to add holdings to this portfolio'
            });
        }

        const holding = await Holding.create({
            portfolio: portfolio._id,
            symbol: symbol.toUpperCase(),
            quantity: parseFloat(quantity),
            buyPrice: parseFloat(buyPrice),
            currentPrice: parseFloat(currentPrice),
            purchaseDate: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Holding created successfully',
            holding
        });
    } catch (err) {
        next(err);
    }
};

const getHoldingsByPortfolio = async (req, res, next) => {
    try {
        const { portfolioId } = req.params;
        const userId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired session. Please login again.'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(portfolioId)) {
            return res.status(404).json({
                success: false,
                error: 'Portfolio not found'
            });
        }

        const portfolio = await Portfolio.findById(portfolioId);

        if (!portfolio) {
            return res.status(404).json({
                success: false,
                error: 'Portfolio not found'
            });
        }

        if (portfolio.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view this portfolio'
            });
        }

        const holdings = await Holding.find({
            portfolio: portfolio._id
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            holdings
        });
    } catch (err) {
        next(err);
    }
};

const getHoldingById = async (req, res, next) => {
    try {
        const { holdingId } = req.params;
        const userId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired session. Please login again.'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(holdingId)) {
            return res.status(404).json({
                success: false,
                error: 'Holding not found'
            });
        }

        const holding = await Holding.findById(holdingId).populate('portfolio');

        if (!holding) {
            return res.status(404).json({
                success: false,
                error: 'Holding not found'
            });
        }

        if (!holding.portfolio || holding.portfolio.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view this holding'
            });
        }

        res.json({
            success: true,
            holding
        });
    } catch (err) {
        next(err);
    }
};

const updateHolding = async (req, res, next) => {
    try {
        const { holdingId } = req.params;
        const { quantity, buyPrice, currentPrice } = req.body;
        const userId = req.userId;

        if (quantity !== undefined && quantity <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Quantity must be a positive number'
            });
        }

        if (buyPrice !== undefined && buyPrice <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Buy price must be a positive number'
            });
        }

        if (currentPrice !== undefined && currentPrice <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Current price must be a positive number'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(holdingId)) {
            return res.status(404).json({
                success: false,
                error: 'Holding not found'
            });
        }

        const holding = await Holding.findById(holdingId).populate('portfolio');

        if (!holding) {
            return res.status(404).json({
                success: false,
                error: 'Holding not found'
            });
        }

        if (!holding.portfolio || holding.portfolio.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this holding'
            });
        }

        if (quantity !== undefined) {
            holding.quantity = parseFloat(quantity);
        }
        if (buyPrice !== undefined) {
            holding.buyPrice = parseFloat(buyPrice);
        }
        if (currentPrice !== undefined) {
            holding.currentPrice = parseFloat(currentPrice);
        }

        await holding.save();

        res.json({
            success: true,
            message: 'Holding updated successfully',
            holding
        });
    } catch (err) {
        next(err);
    }
};

const deleteHolding = async (req, res, next) => {
    try {
        const { holdingId } = req.params;
        const userId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(holdingId)) {
            return res.status(404).json({
                success: false,
                error: 'Holding not found'
            });
        }

        const holding = await Holding.findById(holdingId).populate('portfolio');

        if (!holding) {
            return res.status(404).json({
                success: false,
                error: 'Holding not found'
            });
        }

        if (!holding.portfolio || holding.portfolio.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this holding'
            });
        }

        await holding.deleteOne();

        res.json({
            success: true,
            message: 'Holding deleted successfully'
        });
    } catch (err) {
        next(err);
    }
};

const { parseHoldingFromText } = require('../utils/aiParser');

const smartAddHolding = async (req, res, next) => {
    try {
        const { text, portfolioId } = req.body;
        const userId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired session. Please login again.'
            });
        }

        if (!text || !portfolioId) {
            return res.status(400).json({
                success: false,
                error: 'Text and portfolioId are required'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(portfolioId)) {
            return res.status(404).json({
                success: false,
                error: 'Portfolio not found'
            });
        }

        const portfolio = await Portfolio.findById(portfolioId);

        if (!portfolio) {
            return res.status(404).json({
                success: false,
                error: 'Portfolio not found'
            });
        }

        if (portfolio.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to add holdings to this portfolio'
            });
        }

        // Use AI to parse the text
        const parsedHolding = await parseHoldingFromText(text);

        if (!parsedHolding) {
            return res.status(400).json({
                success: false,
                error: 'Could not understand the holding details. Please try a format like "Bought 10 AAPL at 150".'
            });
        }

        // Create the holding
        const holding = await Holding.create({
            portfolio: portfolio._id,
            symbol: parsedHolding.symbol.toUpperCase(),
            quantity: parseFloat(parsedHolding.quantity),
            buyPrice: parseFloat(parsedHolding.buyPrice),
            currentPrice: parseFloat(parsedHolding.buyPrice), // Assume current price is buy price initially
            purchaseDate: new Date(parsedHolding.purchaseDate)
        });

        res.status(201).json({
            success: true,
            message: 'Holding created successfully via AI',
            holding
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createHolding,
    getHoldingsByPortfolio,
    getHoldingById,
    updateHolding,
    deleteHolding,
    smartAddHolding
};
