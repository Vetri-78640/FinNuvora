const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const createHolding = async (req, res, next) => {
  try {
    const { portfolioId, symbol, quantity, buyPrice, currentPrice } = req.body;
    const userId = req.userId;

    if (!portfolioId || !symbol || !quantity || !buyPrice || !currentPrice) {
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

    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId }
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found'
      });
    }

    if (portfolio.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to add holdings to this portfolio'
      });
    }

    const holding = await prisma.holding.create({
      data: {
        portfolioId,
        symbol: symbol.toUpperCase(),
        quantity: parseFloat(quantity),
        buyPrice: parseFloat(buyPrice),
        currentPrice: parseFloat(currentPrice),
        purchaseDate: new Date()
      }
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

    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId }
    });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio not found'
      });
    }

    if (portfolio.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this portfolio'
      });
    }

    const holdings = await prisma.holding.findMany({
      where: { portfolioId }
    });

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

    const holding = await prisma.holding.findUnique({
      where: { id: holdingId },
      include: { portfolio: true }
    });

    if (!holding) {
      return res.status(404).json({
        success: false,
        error: 'Holding not found'
      });
    }

    if (holding.portfolio.userId !== userId) {
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

    const holding = await prisma.holding.findUnique({
      where: { id: holdingId },
      include: { portfolio: true }
    });

    if (!holding) {
      return res.status(404).json({
        success: false,
        error: 'Holding not found'
      });
    }

    if (holding.portfolio.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this holding'
      });
    }

    const updatedHolding = await prisma.holding.update({
      where: { id: holdingId },
      data: {
        ...(quantity !== undefined && { quantity: parseFloat(quantity) }),
        ...(buyPrice !== undefined && { buyPrice: parseFloat(buyPrice) }),
        ...(currentPrice !== undefined && { currentPrice: parseFloat(currentPrice) })
      }
    });

    res.json({
      success: true,
      message: 'Holding updated successfully',
      holding: updatedHolding
    });
  } catch (err) {
    next(err);
  }
};

const deleteHolding = async (req, res, next) => {
  try {
    const { holdingId } = req.params;
    const userId = req.userId;

    const holding = await prisma.holding.findUnique({
      where: { id: holdingId },
      include: { portfolio: true }
    });

    if (!holding) {
      return res.status(404).json({
        success: false,
        error: 'Holding not found'
      });
    }

    if (holding.portfolio.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this holding'
      });
    }

    await prisma.holding.delete({
      where: { id: holdingId }
    });

    res.json({
      success: true,
      message: 'Holding deleted successfully'
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
  deleteHolding
};
