const mongoose = require('mongoose');
const UserPreferences = require('../models/UserPreferences');

const getPreferences = async (req, res, next) => {
    try {
        const userId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired session. Please login again.'
            });
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);
        let preferences = await UserPreferences.findOne({ user: userObjectId });

        if (!preferences) {
            preferences = new UserPreferences({ user: userObjectId });
            await preferences.save();
        }

        res.json({
            success: true,
            preferences
        });
    } catch (err) {
        next(err);
    }
};

const updatePreferences = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { theme, notifications, currency, language } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired session. Please login again.'
            });
        }

        const updateData = {};
        if (theme) updateData.theme = theme;
        if (notifications) updateData.notifications = notifications;
        if (currency) updateData.currency = currency;
        if (language) updateData.language = language;

        const userObjectId = new mongoose.Types.ObjectId(userId);
        let preferences = await UserPreferences.findOne({ user: userObjectId });

        if (!preferences) {
            preferences = new UserPreferences({ user: userObjectId, ...updateData });
            await preferences.save();
        } else {
            Object.assign(preferences, updateData);
            await preferences.save();
        }

        res.json({
            success: true,
            message: 'Preferences updated successfully',
            preferences
        });
    } catch (err) {
        next(err);
    }
};

const resetPreferences = async (req, res, next) => {
    try {
        const userId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired session. Please login again.'
            });
        }

        await UserPreferences.deleteOne({ user: new mongoose.Types.ObjectId(userId) });

        const newPreferences = new UserPreferences({ user: new mongoose.Types.ObjectId(userId) });
        await newPreferences.save();

        res.json({
            success: true,
            message: 'Preferences reset to defaults',
            preferences: newPreferences
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getPreferences,
    updatePreferences,
    resetPreferences
};
