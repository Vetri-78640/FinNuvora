const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');

const getProfile = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { name, email } = req.body;
    console.log('Update Profile Body:', req.body); // Debug log

    // Validation removed to debug 400 error. 
    // If req.body is empty, updateData will be empty and no changes will be made.
    /*
    if (!name && !email && !req.body.currency && req.body.accountBalance === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Provide at least one field to update'
      });
    }
    */

    if (email) {
      const normalizedEmail = email.toLowerCase();
      const existingUser = await User.findOne({ email: normalizedEmail });

      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(409).json({
          success: false,
          error: 'Email already in use'
        });
      }
    }

    const updateData = {};

    if (name) {
      updateData.name = name;
    }
    if (email) {
      updateData.email = email.toLowerCase();
    }
    if (req.body.currency) {
      updateData.currency = req.body.currency;
    }
    if (req.body.accountBalance !== undefined) {
      updateData.accountBalance = Number(req.body.accountBalance);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      {
        new: true,
        runValidators: true,
        projection: {
          password: 0
        }
      }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Old password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Old password is incorrect'
      });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        error: 'New password must be different from old password'
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedNewPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword
};
