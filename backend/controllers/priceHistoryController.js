const PriceHistory = require('../models/PriceHistory');

const recordPriceHistory = async (req, res, next) => {
  try {
    const { symbol, price } = req.body;

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

    const priceRecord = new PriceHistory({
      symbol: symbol.toUpperCase(),
      price: parseFloat(price),
      source: 'manual'
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

    if (!symbol) {
      return res.status(400).json({
        success: false,
        error: 'Symbol is required'
      });
    }

    const daysBack = parseInt(days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const history = await PriceHistory.find({
      symbol: symbol.toUpperCase(),
      timestamp: { $gte: startDate }
    }).sort({ timestamp: -1 });

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

    if (!symbol) {
      return res.status(400).json({
        success: false,
        error: 'Symbol is required'
      });
    }

    const latestPrice = await PriceHistory.findOne({
      symbol: symbol.toUpperCase()
    }).sort({ timestamp: -1 });

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
