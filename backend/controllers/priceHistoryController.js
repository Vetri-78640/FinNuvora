const mongoose = require('mongoose');
const PriceHistory = require('../models/PriceHistory');

const recordPriceHistory = async (req, res, next) => {
  try {
    const { symbol, price } = req.body;
    const userId = req.userId;

    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session. Please login again.'
      });
    }

    if (!symbol || !price) {
      return res.status(400).json({
        success: false,
        error: 'Symbol and price are required'
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Price must be positive'
      });
    }

    const payload = {
      symbol: symbol.toUpperCase(),
      price: parseFloat(price),
      source: 'manual'
    };

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      payload.user = new mongoose.Types.ObjectId(userId);
    }

    const priceRecord = new PriceHistory({
      ...payload
    });

    await priceRecord.save();

    res.status(201).json({
      success: true,
      message: 'Price recorded successfully',
      data: priceRecord
    });
  } catch (err) {
    next(err);
  }
};

const getPriceHistory = async (req, res, next) => {
  try {
    const { symbol, days } = req.query;
    const userId = req.userId;

    if (!symbol) {
      return res.status(400).json({
        success: false,
        error: 'Symbol is required'
      });
    }

    const daysBack = parseInt(days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session. Please login again.'
      });
    }

    const query = {
      symbol: symbol.toUpperCase(),
      timestamp: { $gte: startDate }
    };

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.user = new mongoose.Types.ObjectId(userId);
    }

    const history = await PriceHistory.find(query).sort({ timestamp: -1 });

    res.json({
      success: true,
      symbol: symbol.toUpperCase(),
      data: history
    });
  } catch (err) {
    next(err);
  }
};

const getLatestPrice = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const userId = req.userId;

    if (!symbol) {
      return res.status(400).json({
        success: false,
        error: 'Symbol is required'
      });
    }

    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session. Please login again.'
      });
    }

    const query = { symbol: symbol.toUpperCase() };
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.user = new mongoose.Types.ObjectId(userId);
    }

    const latestPrice = await PriceHistory.findOne(query).sort({ timestamp: -1 });

    if (!latestPrice) {
      return res.status(404).json({
        success: false,
        error: 'No price history found for this symbol'
      });
    }

    res.json({
      success: true,
      data: latestPrice
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  recordPriceHistory,
  getPriceHistory,
  getLatestPrice
};
