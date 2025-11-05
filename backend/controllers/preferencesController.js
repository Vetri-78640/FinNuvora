const UserPreferences = require('../models/UserPreferences');

const getPreferences = async (req, res, next) => {
    try {
        const userId = req.userId;

        let preferences = await UserPreferences.findOne({ userId });

        if (!preferences) {
        preferences = new UserPreferences({ userId });
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

        let preferences = await UserPreferences.findOne({ userId });

        if (!preferences) {
        preferences = new UserPreferences({ userId });
        }

        if (theme) preferences.theme = theme;
        if (notifications) {
        preferences.notifications = {
            ...preferences.notifications,
            ...notifications
        };
        }
        if (currency) preferences.currency = currency;
        if (language) preferences.language = language;

        preferences.updatedAt = new Date();
        await preferences.save();

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

        await UserPreferences.deleteOne({ userId });

        const newPreferences = new UserPreferences({ userId });
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
