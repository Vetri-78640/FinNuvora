const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getProfile = async (req, res, next) => {
  try {
    const userId = req.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });

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

    if (!name && !email) {
      return res.status(400).json({
        success: false,
        error: 'Provide at least one field to update: name or email'
      });
    }

    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser && existingUser.id !== userId) {
        return res.status(409).json({
          success: false,
          error: 'Email already in use'
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email })
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });

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

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

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

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword
      }
    });

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
