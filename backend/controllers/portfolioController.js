const mongoose = require('mongoose');
const Portfolio = require('../models/Portfolio');
const Holding = require('../models/Holding');

const createPortfolio = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session. Please login again.',
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Portfolio name is required'
      });
    }

    const portfolio = await Portfolio.create({
      user: new mongoose.Types.ObjectId(userId),
      name,
      description: description || null
    });

    res.status(201).json({
      success: true,
      message: 'Portfolio created successfully',
      portfolio
    });
  } catch (err) {
    next(err);
  }
};

// READ - Get all portfolios for logged-in user
const getPortfolios = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session. Please login again.',
      });
    }

    const portfolios = await Portfolio.find({
      user: new mongoose.Types.ObjectId(userId)
    })
      .populate('holdings')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      portfolios
    });
  } catch (err) {
    next(err);
  }
};

// READ - Get single portfolio by ID
const getPortfolioById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found'
      });
    }

    const portfolio = await Portfolio.findById(id).populate('holdings');

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

    res.json({
      success: true,
      portfolio
    });
  } catch (err) {
    next(err);
  }
};

// UPDATE - Update portfolio
const updatePortfolio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found'
      });
    }

    const portfolio = await Portfolio.findById(id);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found'
      });
    }

    if (portfolio.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this portfolio'
      });
    }

    if (name) {
      portfolio.name = name;
    }
    if (description !== undefined) {
      portfolio.description = description || null;
    }

    await portfolio.save();

    res.json({
      success: true,
      message: 'Portfolio updated successfully',
      portfolio
    });
  } catch (err) {
    next(err);
  }
};

// DELETE - Delete portfolio
const deletePortfolio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found'
      });
    }

    const portfolio = await Portfolio.findById(id);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found'
      });
    }

    if (portfolio.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this portfolio'
      });
    }

    await Holding.deleteMany({ portfolio: portfolio._id });
    await portfolio.deleteOne();

    res.json({
      success: true,
      message: 'Portfolio deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPortfolio,
  getPortfolios,
  getPortfolioById,
  updatePortfolio,
  deletePortfolio
};
