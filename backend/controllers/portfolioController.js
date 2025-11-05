const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const createPortfolio = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const userId = req.userId;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Portfolio name is required'
      });
    }

    const portfolio = await prisma.portfolio.create({
      data: {
        userId,
        name,
        description: description || null
      }
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

    const portfolios = await prisma.portfolio.findMany({
      where: { userId },
      include: {
        holdings: true // Include holdings in response
      }
    });

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

    const portfolio = await prisma.portfolio.findUnique({
      where: { id },
      include: { holdings: true }
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

    const portfolio = await prisma.portfolio.findUnique({
      where: { id }
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
        error: 'Not authorized to update this portfolio'
      });
    }

    const updatedPortfolio = await prisma.portfolio.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description })
      }
    });

    res.json({
      success: true,
      message: 'Portfolio updated successfully',
      portfolio: updatedPortfolio
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

    const portfolio = await prisma.portfolio.findUnique({
      where: { id }
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
        error: 'Not authorized to delete this portfolio'
      });
    }

    await prisma.portfolio.delete({
      where: { id }
    });

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
