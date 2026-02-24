const chatService = require('../services/chatService');

const getHistory = async (req, res, next) => {
    try {
        const messages = await chatService.getHistory(req.userId);
        res.json({
            success: true,
            messages
        });
    } catch (err) {
        next(err);
    }
};

const sendMessage = async (req, res, next) => {
    try {
        const { message } = req.body;
        console.log('[ChatController] Received Body:', JSON.stringify(req.body));

        if (!message) {
            console.error('[ChatController] Error: Message is required');
            return res.status(400).json({ success: false, error: 'Message is required' });
        }

        const result = await chatService.processMessage(req.userId, message);

        res.json({
            success: true,
            message: result.responseText,
            history: result.history,
            actionTaken: result.actionTaken
        });
    } catch (err) {
        next(err);
    }
};

const clearHistory = async (req, res, next) => {
    try {
        await chatService.clearHistory(req.userId);
        res.json({ success: true, message: 'Chat history cleared' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getHistory,
    sendMessage,
    clearHistory
};
