// Exchange rates cache
let RATES = {
    USD: 1,
    INR: 83.12,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 149.50,
    CAD: 1.36,
    AUD: 1.52
};

let lastFetchTime = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Fetch latest exchange rates from API
const fetchExchangeRates = async () => {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();

        if (data && data.rates) {
            RATES = {
                USD: 1,
                INR: data.rates.INR || 83.12,
                EUR: data.rates.EUR || 0.92,
                GBP: data.rates.GBP || 0.79,
                JPY: data.rates.JPY || 149.50,
                CAD: data.rates.CAD || 1.36,
                AUD: data.rates.AUD || 1.52
            };
            lastFetchTime = Date.now();
            console.log('Exchange rates updated successfully');
        }
    } catch (error) {
        console.error('Failed to fetch exchange rates, using cached values:', error.message);
    }
};

// Get current rates (fetch if cache expired)
const getExchangeRates = async () => {
    const now = Date.now();

    // Fetch if never fetched or cache expired
    if (!lastFetchTime || (now - lastFetchTime) > CACHE_DURATION) {
        await fetchExchangeRates();
    }

    return RATES;
};

// Convert amount from any currency to USD
const convertToUSD = (amount, fromCurrency) => {
    if (fromCurrency === 'USD') return amount;
    return amount / RATES[fromCurrency];
};

// Convert amount from USD to any currency
const convertFromUSD = (amount, toCurrency) => {
    if (toCurrency === 'USD') return amount;
    return amount * RATES[toCurrency];
};

// Initialize rates on module load
fetchExchangeRates();

module.exports = {
    RATES,
    getExchangeRates,
    fetchExchangeRates,
    convertToUSD,
    convertFromUSD
};
