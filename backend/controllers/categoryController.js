const mongoose = require('mongoose');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');

const createCategory = async (req, res, next) => {
  try {
    const { name, color, icon } = req.body;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session. Please login again.'
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Category name is required'
      });
    }

    const existingCategory = await Category.findOne({
      user: new mongoose.Types.ObjectId(userId),
      name: name.trim()
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        error: 'Category already exists'
      });
    }

    const category = await Category.create({
      user: new mongoose.Types.ObjectId(userId),
      name: name.trim(),
      color: color || '#3B82F6',
      icon: icon || null
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

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session. Please login again.'
      });
    }

    const categories = await Category.find({
      user: new mongoose.Types.ObjectId(userId)
    })
      .sort({ name: 1 })
      .lean();

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

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session. Please login again.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    if (category.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this category'
      });
    }

    if (name) {
      category.name = name.trim();
    }
    if (color) {
      category.color = color;
    }
    if (icon !== undefined) {
      category.icon = icon || null;
    }

    await category.save();

    res.json({
      success: true,
      message: 'Category updated successfully',
      category
    });
  } catch (err) {
    next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session. Please login again.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    if (category.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this category'
      });
    }

    const transactionCount = await Transaction.countDocuments({ category: category._id });

    if (transactionCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category with existing transactions'
      });
    }

    await category.deleteOne();

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
