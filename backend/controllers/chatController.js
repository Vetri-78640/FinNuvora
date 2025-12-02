const Chat = require('../models/Chat');
const Transaction = require('../models/Transaction');
const Holding = require('../models/Holding');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const getHistory = async (req, res, next) => {
    try {
        let chat = await Chat.findOne({ user: req.userId });

        if (!chat) {
            // Create new chat if not exists
            chat = await Chat.create({
                user: req.userId,
                messages: []
            });
        }

        res.json({
            success: true,
            messages: chat.messages
        });
    } catch (err) {
        next(err);
    }
};

const Category = require('../models/Category');
const User = require('../models/User');

const { RATES } = require('../utils/currencyUtils');

const sendMessage = async (req, res, next) => {
    try {
        console.log('sendMessage called'); // Debug
        console.log('User ID:', req.userId); // Debug
        console.log('Body:', req.body); // Debug
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        // Get user's financial context
        const transactions = await Transaction.find({ user: req.userId })
            .sort({ date: -1 })
            .limit(20)
            .populate('category');

        const holdings = await Holding.find({ user: req.userId });
        const categories = await Category.find({ user: req.userId });
        const categoryNames = categories.map(c => c.name).join(', ');

        // Prepare context string
        const context = `
    User Financial Data:
    - Recent Transactions: ${JSON.stringify(transactions.map(t => ({
            id: t._id,
            date: t.date,
            amount: t.amount,
            type: t.type,
            category: t.category?.name,
            description: t.description
        })))}
    - Current Holdings: ${JSON.stringify(holdings.map(h => ({
            id: h._id,
            symbol: h.symbol,
            quantity: h.quantity,
            buyPrice: h.buyPrice,
            currentPrice: h.currentPrice
        })))}
    - Available Categories: ${categoryNames}
    - Exchange Rates (Base USD): ${JSON.stringify(RATES)}
    `;

        // Get chat history
        let chat = await Chat.findOne({ user: req.userId });
        if (!chat) {
            chat = await Chat.create({ user: req.userId, messages: [] });
        }

        // Add user message to history
        chat.messages.push({
            role: 'user',
            content: message
        });

        // Construct prompt with history
        const historyPrompt = chat.messages.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n');

        const prompt = `
    You are FinNuvora's AI Financial Advisor. You are helpful, concise, and knowledgeable about finance.
    Use the provided financial data to answer the user's question.
    
    ${context}
    
    IMPORTANT INSTRUCTION FOR ACTIONS:
    You can perform CRUD operations. If the user asks to ADD, DELETE, or UPDATE, output a JSON block at the VERY END.
    
    CRITICAL CURRENCY RULE:
    - The system stores ALL amounts in INR (Indian Rupees).
    - Convert foreign currencies to INR using 'Exchange Rates' before putting in JSON.
    - If user says "dollars" or "$", convert to INR.
    
    JSON SCHEMAS:
    
    1. ADD TRANSACTION:
    \`\`\`json
    {
      "action": "ADD_TRANSACTION",
      "data": {
        "amount": <number_in_INR>,
        "description": "<string>",
        "type": "<income|expense|investment>",
        "categoryName": "<string>" 
      }
    }
    \`\`\`

    2. DELETE TRANSACTION:
    \`\`\`json
    {
      "action": "DELETE_TRANSACTION",
      "data": {
        "id": "<transaction_id>"
      }
    }
    \`\`\`

    3. UPDATE TRANSACTION:
    \`\`\`json
    {
      "action": "UPDATE_TRANSACTION",
      "data": {
        "id": "<transaction_id>",
        "amount": <optional_number_in_INR>,
        "description": "<optional_string>",
        "type": "<optional_string>",
        "categoryName": "<optional_string>"
      }
    }
    \`\`\`

    4. DELETE HOLDING:
    \`\`\`json
    {
      "action": "DELETE_HOLDING",
      "data": {
        "id": "<holding_id>"
      }
    }
    \`\`\`
    
    - For 'categoryName', pick the closest match from 'Available Categories'. If none match, infer a standard one.
    - If you output JSON, keep your text response brief.
    
    Conversation History:
    ${historyPrompt}
    
    User: ${message}
    Advisor:
    `;

        console.log('Sending prompt to AI...'); // Debug
        const result = await model.generateContent(prompt);
        console.log('AI response received'); // Debug
        let responseText = result.response.text();
        let actionTaken = false;

        console.log('AI Response:', responseText); // Debug log

        // Check for JSON block to execute action
        // More flexible regex to catch json blocks with different spacing
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);

        if (jsonMatch) {
            console.log('JSON Block found:', jsonMatch[1]); // Debug log

            // Always strip the JSON block from the response text first
            responseText = responseText.replace(/```json\s*[\s\S]*?\s*```/, '').trim();

            try {
                const actionData = JSON.parse(jsonMatch[1]);
                console.log('Parsed Action Data:', actionData); // Debug log

                if (actionData.action === 'ADD_TRANSACTION') {
                    // Find category or create it
                    let category = await Category.findOne({
                        user: req.userId,
                        name: { $regex: new RegExp(`^${actionData.data.categoryName}$`, 'i') }
                    });

                    if (!category) {
                        // Create the category if it doesn't exist
                        category = await Category.create({
                            user: req.userId,
                            name: actionData.data.categoryName, // Use the name provided by AI
                            color: '#3B82F6' // Default blue
                        });
                    }

                    console.log('Creating transaction with category:', category?.name); // Debug log

                    // Create transaction
                    const newTx = await Transaction.create({
                        user: req.userId,
                        amount: actionData.data.amount,
                        description: actionData.data.description,
                        type: actionData.data.type || 'expense',
                        category: category._id,
                        date: new Date()
                    });

                    // Update User Balance
                    const multiplier = (actionData.data.type === 'income') ? 1 : -1;
                    await User.findByIdAndUpdate(req.userId, {
                        $inc: { accountBalance: actionData.data.amount * multiplier }
                    });

                    console.log('Transaction created:', newTx._id); // Debug log
                    actionTaken = true;
                } else if (actionData.action === 'DELETE_TRANSACTION') {
                    const tx = await Transaction.findOne({ _id: actionData.data.id, user: req.userId });
                    if (tx) {
                        await Transaction.findByIdAndDelete(actionData.data.id);
                        // Revert balance
                        const multiplier = (tx.type === 'income') ? -1 : 1;
                        await User.findByIdAndUpdate(req.userId, {
                            $inc: { accountBalance: tx.amount * multiplier }
                        });
                        actionTaken = true;
                    }
                } else if (actionData.action === 'UPDATE_TRANSACTION') {
                    const tx = await Transaction.findOne({ _id: actionData.data.id, user: req.userId });
                    if (tx) {
                        // Revert old balance effect
                        const oldMultiplier = (tx.type === 'income') ? -1 : 1;
                        await User.findByIdAndUpdate(req.userId, {
                            $inc: { accountBalance: tx.amount * oldMultiplier }
                        });

                        // Update fields
                        if (actionData.data.amount) tx.amount = actionData.data.amount;
                        if (actionData.data.description) tx.description = actionData.data.description;
                        if (actionData.data.type) tx.type = actionData.data.type;

                        if (actionData.data.categoryName) {
                            let category = await Category.findOne({
                                user: req.userId,
                                name: { $regex: new RegExp(`^${actionData.data.categoryName}$`, 'i') }
                            });

                            if (!category) {
                                category = await Category.create({
                                    user: req.userId,
                                    name: actionData.data.categoryName,
                                    color: '#3B82F6'
                                });
                            }
                            tx.category = category._id;
                        }

                        await tx.save();

                        // Apply new balance effect
                        const newMultiplier = (tx.type === 'income') ? 1 : -1;
                        await User.findByIdAndUpdate(req.userId, {
                            $inc: { accountBalance: tx.amount * newMultiplier }
                        });
                        actionTaken = true;
                    }
                } else if (actionData.action === 'DELETE_HOLDING') {
                    await Holding.findOneAndDelete({ _id: actionData.data.id, user: req.userId });
                    actionTaken = true;
                }

            } catch (e) {
                console.error("Failed to execute AI action", e);
                // Append a user-friendly error message
                responseText += "\n\n(I tried to perform that action, but something went wrong. Please try again.)";
            }
        } else {
            console.log('No JSON block found in response');
        }

        // Add AI response to history
        chat.messages.push({
            role: 'model',
            content: responseText
        });

        await chat.save();

        res.json({
            success: true,
            message: responseText,
            history: chat.messages,
            actionTaken
        });
    } catch (err) {
        console.error('Chat Error:', err);
        next(err);
    }
};

const clearHistory = async (req, res, next) => {
    try {
        await Chat.findOneAndDelete({ user: req.userId });
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
