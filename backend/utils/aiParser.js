const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

/**
 * Parse unstructured transaction text into structured data
 * @param {string} text - The raw text from PDF or user input
 * @returns {Promise<Array>} - Array of transaction objects
 */
const parseTransactionsFromText = async (text) => {
    try {
        const prompt = `
    Extract financial transactions from the following text.
    Return ONLY a JSON array of objects. Do not include markdown formatting (like \`\`\`json).
    
    Each object should have:
    - date: ISO 8601 date string (YYYY-MM-DD)
    - description: string (clean up merchant names)
    - amount: number (positive for income, negative for expense)
    - type: "income" or "expense"
    
    Text to parse:
    ${text.substring(0, 10000)} // Limit context window
    `;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Clean up potential markdown code blocks if Gemini adds them
        const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanJson);
    } catch (error) {
        console.error('AI Transaction Parsing Error:', error);
        return [];
    }
};

/**
 * Parse natural language holding addition
 * @param {string} text - e.g., "Bought 10 AAPL at 150"
 * @returns {Promise<Object>} - Holding object
 */
const parseHoldingFromText = async (text) => {
    try {
        const prompt = `
    Extract stock holding details from this text: "${text}"
    Return ONLY a JSON object. Do not include markdown formatting.
    
    Fields required:
    - symbol: string (uppercase stock ticker, e.g., AAPL)
    - quantity: number
    - buyPrice: number
    - purchaseDate: ISO 8601 date string (YYYY-MM-DD). If not specified, use today's date "${new Date().toISOString().split('T')[0]}".
    
    If the text is invalid or missing key info (symbol, quantity, price), return null.
    `;

        const result = await model.generateContent(prompt);
        const response = result.response.text();
        const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanJson);
    } catch (error) {
        console.error('AI Holding Parsing Error:', error);
        return null;
    }
};

/**
 * Parse receipt image to extract transaction details
 * @param {Buffer} imageBuffer - The image buffer
 * @param {string} mimeType - The mime type of the image
 * @returns {Promise<Object>} - Transaction object
 */
const parseReceipt = async (imageBuffer, mimeType) => {
    try {
        const prompt = `
    Analyze this receipt image and extract the following details:
    - Merchant name (as description)
    - Date (ISO 8601 YYYY-MM-DD)
    - Total amount (number)
    - Category (guess based on merchant, e.g., Food, Transport, Shopping, Utilities)
    
    Return ONLY a JSON object. Do not include markdown formatting.
    
    Example:
    {
      "description": "Starbucks",
      "date": "2024-03-15",
      "amount": 12.50,
      "category": "Food"
    }
    
    If you cannot read the receipt or it's not a receipt, return null.
    `;

        const imagePart = {
            inlineData: {
                data: imageBuffer.toString('base64'),
                mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = result.response.text();
        const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanJson);
    } catch (error) {
        console.error('AI Receipt Parsing Error:', error);
        return null;
    }
};

module.exports = {
    parseTransactionsFromText,
    parseHoldingFromText,
    parseReceipt
};
