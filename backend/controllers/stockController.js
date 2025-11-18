const axios = require('axios');

const ALPHA_VANTAGE_API = 'https://www.alphavantage.co/query';
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';

const getStockPrice = async (req, res, next) => {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      return res.status(400).json({
        success: false,
        error: 'Symbol is required'
      });
    }

    const response = await axios.get(ALPHA_VANTAGE_API, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol.toUpperCase(),
        apikey: API_KEY
      }
    });

    const quote = response.data['Global Quote'];

    if (!quote || !quote['05. price']) {
      return res.status(404).json({
        success: false,
        error: 'Stock not found or API limit reached'
      });
    }

    const priceData = {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: quote['10. change percent'],
      timestamp: new Date()
    };

    res.json({
      success: true,
      data: priceData
    });
  } catch (err) {
    next(err);
  }
};

const getStockPriceDaily = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { outputsize } = req.query;

    if (!symbol) {
      return res.status(400).json({
        success: false,
        error: 'Symbol is required'
      });
    }

    const response = await axios.get(ALPHA_VANTAGE_API, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol.toUpperCase(),
        outputsize: outputsize === 'full' ? 'full' : 'compact',
        apikey: API_KEY
      }
    });

    const timeSeries = response.data['Time Series (Daily)'];
    const metaData = response.data['Meta Data'];

    if (!timeSeries) {
      return res.status(404).json({
        success: false,
        error: 'Stock data not found or API limit reached'
      });
    }

    const data = Object.entries(timeSeries).map(([date, values]) => ({
      date,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume'])
    }));

    res.json({
      success: true,
      symbol: metaData['2. Symbol'],
      lastRefreshed: metaData['3. Last Refreshed'],
      data
    });
  } catch (err) {
    next(err);
  }
};

const getMultipleStockPrices = async (req, res, next) => {
  try {
    const { symbols } = req.body;

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'symbols array is required'
      });
    }

    const prices = [];

    for (const symbol of symbols) {
      try {
        const response = await axios.get(ALPHA_VANTAGE_API, {
          params: {
            function: 'GLOBAL_QUOTE',
            symbol: symbol.toUpperCase(),
            apikey: API_KEY
          }
        });

        const quote = response.data['Global Quote'];

        if (quote && quote['05. price']) {
          prices.push({
            symbol: quote['01. symbol'],
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: quote['10. change percent'],
            timestamp: new Date()
          });
        }
      } catch (err) {
        console.error(`Error fetching ${symbol}:`, err.message);
      }
    }

    res.json({
      success: true,
      data: prices
    });
  } catch (err) {
    next(err);
  }
};

const searchStocks = async (req, res, next) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        error: 'keyword is required'
      });
    }

    const response = await axios.get(ALPHA_VANTAGE_API, {
      params: {
        function: 'SYMBOL_SEARCH',
        keywords: keyword,
        apikey: API_KEY
      }
    });

    const matches = response.data['bestMatches'] || [];

    const results = matches.map(match => ({
      symbol: match['1. symbol'],
      name: match['2. name'],
      type: match['3. type'],
      region: match['4. region'],
      marketOpen: match['5. marketOpen'],
      marketClose: match['6. marketClose'],
      timezone: match['7. timezone'],
      currency: match['8. currency'],
      matchScore: match['9. matchScore']
    }));

    res.json({
      success: true,
      results
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStockPrice,
  getStockPriceDaily,
  getMultipleStockPrices,
  searchStocks
};
