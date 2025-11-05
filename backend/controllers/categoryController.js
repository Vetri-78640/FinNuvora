const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const createCategory = async (req, res, next) => {
  try {
    const { name, color, icon } = req.body;
    const userId = req.userId;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Category name is required'
      });
    }

    const existingCategory = await prisma.category.findUnique({
      where: {
        userId_name: { userId, name }
      }
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        error: 'Category already exists'
      });
    }

    const category = await prisma.category.create({
      data: {
        userId,
        name,
        color: color || '#3B82F6',
        icon: icon || null
      }
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (err) {
    next(err);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const userId = req.userId;

    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      categories
    });
  } catch (err) {
    next(err);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, color, icon } = req.body;
    const userId = req.userId;

    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    if (category.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this category'
      });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(color && { color }),
        ...(icon !== undefined && { icon })
      }
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (err) {
    next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const category = await prisma.category.findUnique({
      where: { id },
      include: { transactions: true }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    if (category.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this category'
      });
    }

    if (category.transactions.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category with existing transactions'
      });
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
};
