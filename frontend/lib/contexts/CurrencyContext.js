'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { userAPI } from '@/lib/api';

const CurrencyContext = createContext();

const RATES = {
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0095,
    JPY: 1.80,
    CAD: 0.016,
    AUD: 0.018,
    CNY: 0.086,
    CHF: 0.011,
    SGD: 0.016,
    NZD: 0.020,
    HKD: 0.093,
    KRW: 16.0,
    BRL: 0.060,
    ZAR: 0.22,
    RUB: 1.10,
    MXN: 0.20
};

const SYMBOLS = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    CNY: '¥',
    CHF: 'Fr',
    SGD: 'S$',
    NZD: 'NZ$',
    HKD: 'HK$',
    KRW: '₩',
    BRL: 'R$',
    ZAR: 'R',
    RUB: '₽',
    MXN: 'Mex$'
};

export function CurrencyProvider({ children }) {
    const { user, checkAuth } = useAuth();
    const [currency, setCurrency] = useState('USD');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initCurrency = async () => {
            // Priority: Local Storage (Immediate User Intent) > User Profile (Server Sync) > IP Detection > Default USD

            // 1. Check Local Storage first
            const savedCurrency = typeof window !== 'undefined' ? localStorage.getItem('currency') : null;

            if (savedCurrency) {
                setCurrency(savedCurrency);
            } else if (user?.currency) {
                // 2. User Profile (only if no local override)
                setCurrency(user.currency);
                if (typeof window !== 'undefined') localStorage.setItem('currency', user.currency);
            } else {
                // 3. IP Detection (Only if nothing else exists)
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

                    const response = await fetch('https://ipapi.co/json/', {
                        signal: controller.signal
                    });
                    clearTimeout(timeoutId);

                    if (!response.ok) throw new Error('IP API failed');

                    const data = await response.json();
                    const countryCode = data.country_code;

                    const currencyMap = {
                        'IN': 'INR', 'US': 'USD', 'GB': 'GBP',
                        'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR',
                        'JP': 'JPY', 'CA': 'CAD', 'AU': 'AUD',
                        'CN': 'CNY', 'CH': 'CHF', 'SG': 'SGD', 'NZ': 'NZD',
                        'HK': 'HKD', 'KR': 'KRW', 'BR': 'BRL', 'ZA': 'ZAR',
                        'RU': 'RUB', 'MX': 'MXN'
                    };

                    const detected = currencyMap[countryCode] || 'USD';
                    setCurrency(detected);
                    if (typeof window !== 'undefined') localStorage.setItem('currency', detected);
                } catch (error) {
                    // Silently fail to avoid console noise, fallback to USD
                    setCurrency('USD');
                }
            }
            setLoading(false);
        };

        initCurrency();
    }, [user]);

    const updateCurrency = async (newCurrency) => {
        try {
            setLoading(true);
            setCurrency(newCurrency); // Optimistic update
            if (typeof window !== 'undefined') localStorage.setItem('currency', newCurrency); // Persist locally
            await userAPI.updateProfile({ currency: newCurrency });
            await checkAuth(); // Refresh global user state
        } catch (error) {
            console.error('Failed to update currency', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        // Amount is in INR (Base)
        // We want to show in User's Currency
        // Rate = UserCurrency / INR
        // Converted = Amount * Rate
        const rate = RATES[currency] || 1;
        const converted = amount * rate;

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(converted);
    };

    const convertAmount = (amount) => {
        // Amount in INR -> User Currency
        const rate = RATES[currency] || 1;
        return amount * rate;
    };

    const convertToUSD = (amount) => {
        // This function name is misleading now. It should be convertToBase (to INR).
        // But to avoid breaking changes, let's see.
        // If components use this to send data to backend, they expect it to be in Base Currency.
        // So this should return amount / rate.
        // If User enters 100 USD. Rate USD = 0.012.
        // Base (INR) = 100 / 0.012 = 8333.
        const rate = RATES[currency] || 1;
        return amount / rate;
    };

    return (
        <CurrencyContext.Provider value={{
            currency,
            updateCurrency,
            formatCurrency,
            convertAmount,
            convertToUSD,
            symbol: SYMBOLS[currency] || '$',
            availableCurrencies: Object.keys(RATES)
        }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    return useContext(CurrencyContext);
}
