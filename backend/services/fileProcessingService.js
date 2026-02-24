const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const { parseTransactionsFromText, parseReceipt } = require('../utils/aiParser');

const logToFile = (message) => {
    try {
        const logPath = path.join(__dirname, '../upload_debug.log');
        const logMessage = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
        fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${logMessage}\n`);
    } catch (e) {
        console.error('Failed to write to log file', e);
    }
};

const processPDF = async (pdfFile, conversionRate = 1) => {
    logToFile({
        name: pdfFile.name,
        size: pdfFile.size,
        tempFilePath: pdfFile.tempFilePath,
        dataLength: pdfFile.data ? pdfFile.data.length : 0
    });

    let dataBuffer = pdfFile.data;

    // If using temp files, data might be empty, read from temp path
    if ((!dataBuffer || dataBuffer.length === 0) && pdfFile.tempFilePath) {
        logToFile(`Reading PDF from temp file: ${pdfFile.tempFilePath}`);
        dataBuffer = fs.readFileSync(pdfFile.tempFilePath);
    }

    if (!dataBuffer || dataBuffer.length === 0) {
        logToFile('Error: Empty file buffer');
        throw new Error('Empty file uploaded or failed to read temp file');
    }

    // Parse PDF
    const pdfData = await pdfParse(dataBuffer);

    // Use AI to parse transactions
    const parsedTransactions = await parseTransactionsFromText(pdfData.text);

    if (!parsedTransactions || parsedTransactions.length === 0) {
        throw new Error('No transactions found in PDF');
    }

    // Apply conversion rate and clean data
    return parsedTransactions.map(t => ({
        date: new Date(t.date),
        description: t.description,
        amount: Math.abs(t.amount) * conversionRate,
        type: t.type || (t.amount > 0 ? 'income' : 'expense'),
        source: 'bank_statement_ai',
    }));
};

const processReceiptImage = async (receiptFile) => {
    // Validate mime type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(receiptFile.mimetype)) {
        throw new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.');
    }

    // Use AI to parse receipt
    const parsedData = await parseReceipt(receiptFile.data, receiptFile.mimetype);

    if (!parsedData) {
        throw new Error('Could not extract details from the receipt. Please try a clearer image.');
    }

    return parsedData;
};

module.exports = {
    processPDF,
    processReceiptImage,
    logToFile
};
