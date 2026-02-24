const { GoogleGenerativeAI } = require('@google/generative-ai');
const Chat = require('../models/Chat');
const Transaction = require('../models/Transaction');
const Holding = require('../models/Holding');
const Category = require('../models/Category');
const User = require('../models/User');
const { RATES } = require('../utils/currencyUtils');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Retry Helper
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const callGeminiWithRetry = async (prompt, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await model.generateContent(prompt);
        } catch (error) {
            console.error(`Gemini API attempt ${i + 1}/${retries} failed:`, error.message);

            if (i === retries - 1) throw error;

            const delay = 1000 * Math.pow(2, i);
            console.log(`Retrying in ${delay}ms...`);
            await wait(delay);
        }
    }
};

const getHistory = async (userId) => {
    let chat = await Chat.findOne({ user: userId });
    if (!chat) {
        chat = await Chat.create({ user: userId, messages: [] });
    }
    return chat.messages;
};

const clearHistory = async (userId) => {
    await Chat.findOneAndDelete({ user: userId });
    return true;
};

const buildContext = async (userId) => {
    const [transactions, holdings, categories] = await Promise.all([
        Transaction.find({ user: userId }).sort({ date: -1 }).limit(20).populate('category'),
        Holding.find({ user: userId }),
        Category.find({ user: userId })
    ]);

    const categoryNames = categories.map(c => c.name).join(', ');

    return `
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
};

const constructPrompt = (context, history) => {
    const historyText = history.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n');

    return `
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
    ${historyText}
    
    Advisor:
    `;
};

const executeAction = async (userId, actionData) => {
    if (actionData.action === 'ADD_TRANSACTION') {
        let category = await Category.findOne({
            user: userId,
            name: { $regex: new RegExp(`^${actionData.data.categoryName}$`, 'i') }
        });

        if (!category) {
            category = await Category.create({
                user: userId,
                name: actionData.data.categoryName,
                color: '#3B82F6'
            });
        }

        const newTx = await Transaction.create({
            user: userId,
            amount: actionData.data.amount,
            description: actionData.data.description,
            type: actionData.data.type || 'expense',
            category: category._id,
            date: new Date()
        });

        const multiplier = (actionData.data.type === 'income') ? 1 : -1;
        await User.findByIdAndUpdate(userId, {
            $inc: { accountBalance: actionData.data.amount * multiplier }
        });

        return true;
    }

    if (actionData.action === 'DELETE_TRANSACTION') {
        const tx = await Transaction.findOne({ _id: actionData.data.id, user: userId });
        if (tx) {
            await Transaction.findByIdAndDelete(actionData.data.id);
            const multiplier = (tx.type === 'income') ? -1 : 1;
            await User.findByIdAndUpdate(userId, {
                $inc: { accountBalance: tx.amount * multiplier }
            });
            return true;
        }
    }

    if (actionData.action === 'UPDATE_TRANSACTION') {
        const tx = await Transaction.findOne({ _id: actionData.data.id, user: userId });
        if (tx) {
            // Revert old balance
            const oldMultiplier = (tx.type === 'income') ? -1 : 1;
            await User.findByIdAndUpdate(userId, {
                $inc: { accountBalance: tx.amount * oldMultiplier }
            });

            if (actionData.data.amount) tx.amount = actionData.data.amount;
            if (actionData.data.description) tx.description = actionData.data.description;
            if (actionData.data.type) tx.type = actionData.data.type;

            if (actionData.data.categoryName) {
                let category = await Category.findOne({
                    user: userId,
                    name: { $regex: new RegExp(`^${actionData.data.categoryName}$`, 'i') }
                });

                if (!category) {
                    category = await Category.create({
                        user: userId,
                        name: actionData.data.categoryName,
                        color: '#3B82F6'
                    });
                }
                tx.category = category._id;
            }

            await tx.save();

            // Apply new balance
            const newMultiplier = (tx.type === 'income') ? 1 : -1;
            await User.findByIdAndUpdate(userId, {
                $inc: { accountBalance: tx.amount * newMultiplier }
            });
            return true;
        }
    }

    if (actionData.action === 'DELETE_HOLDING') {
        await Holding.findOneAndDelete({ _id: actionData.data.id, user: userId });
        return true;
    }

    return false;
};

const processMessage = async (userId, message) => {
    // Get History
    let chat = await Chat.findOne({ user: userId });
    if (!chat) {
        chat = await Chat.create({ user: userId, messages: [] });
    }

    // Add user message
    chat.messages.push({ role: 'user', content: message });

    // Build Context
    const context = await buildContext(userId);

    // Construct Prompt
    // Add the *current* message to the history prompt manually because chat.messages might contain unrelated DB fields
    // or we just want to ensure the latest message is emphasized.
    // Actually, simple way is to pass chat.messages excluding the one we just added? 
    // Wait, constructPrompt uses .slice(-10), so it will include the just added user message if we save it first or push it.
    // We haven't saved 'chat' yet, but the array in memory has it.

    const prompt = constructPrompt(context, chat.messages);

    // Generate AI Response with Retry
    const result = await callGeminiWithRetry(prompt);
    let responseText = result.response.text();
    let actionTaken = false;

    // Check for Action JSON
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);

    if (jsonMatch) {
        // Strip JSON from text
        responseText = responseText.replace(/```json\s*[\s\S]*?\s*```/, '').trim();

        try {
            const actionData = JSON.parse(jsonMatch[1]);
            actionTaken = await executeAction(userId, actionData);
        } catch (e) {
            console.error("Failed to execute AI action", e);
            responseText += "\n\n(I tried to perform that action, but something went wrong.)";
        }
    }

    // Save AI Response
    chat.messages.push({ role: 'model', content: responseText });
    await chat.save();

    return {
        responseText,
        history: chat.messages,
        actionTaken
    };
};

module.exports = {
    getHistory,
    processMessage,
    clearHistory
};
