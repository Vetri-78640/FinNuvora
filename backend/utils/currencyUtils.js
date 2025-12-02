// Exchange rates cache (Base: INR)
let RATES = {
    INR: 1,
    USD: 0.012, // Approx 1/83
    EUR: 0.011,
    GBP: 0.0095,
    JPY: 1.80,
    CAD: 0.016,
    AUD: 0.018
};

let lastFetchTime = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Fetch latest exchange rates from API and rebase to INR
const fetchExchangeRates = async () => {
    try {
        // API returns rates relative to USD
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();

        if (data && data.rates) {
            const usdToInr = data.rates.INR || 83.12;

            // Rebase all rates to INR (Rate_X_in_INR = Rate_X_in_USD / Rate_INR_in_USD)
            // Actually: 1 USD = 83 INR. 1 EUR = 0.92 USD.
            // We want: How much of Currency X is 1 INR?
            // 1 INR = (1/83) USD.
            // Rate in map should be: 1 INR = ? Currency

            // Wait, usually RATES map is: 1 Base = X Currency.
            // If Base is INR. RATES.USD should be ~0.012.
            // API gives: 1 USD = X Currency.
            // 1 USD = 83 INR.
            // 1 USD = 0.92 EUR.
            // So 83 INR = 0.92 EUR => 1 INR = 0.92 / 83 EUR.

            const newRates = {
                INR: 1
            };

            Object.keys(data.rates).forEach(currency => {
                if (currency !== 'INR') {
                    newRates[currency] = data.rates[currency] / usdToInr;
                }
            });

            RATES = newRates;
            lastFetchTime = Date.now();
            console.log('Exchange rates updated successfully (Base: INR)');
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

// Convert amount from any currency to Base (INR)
const convertToBase = (amount, fromCurrency) => {
    if (fromCurrency === 'INR') return amount;
    // Amount in Foreign / Rate of Foreign per INR = Amount in INR
    // Example: 100 USD. Rate USD (per INR) = 0.012.
    // 100 / 0.012 = 8333 INR. Correct.
    return amount / (RATES[fromCurrency] || 1);
};

// Convert amount from Base (INR) to any currency
const convertFromBase = (amount, toCurrency) => {
    if (toCurrency === 'INR') return amount;
    // Amount in INR * Rate of Foreign per INR = Amount in Foreign
    // Example: 8333 INR * 0.012 = 100 USD. Correct.
    return amount * (RATES[toCurrency] || 1);
};

// Initialize rates on module load
fetchExchangeRates();

module.exports = {
    RATES,
    getExchangeRates,
    fetchExchangeRates,
    convertToBase,
    convertFromBase
};
