'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { userAPI } from '@/lib/api';

const CurrencyContext = createContext();

const RATES = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.50,
    JPY: 151.50,
    CAD: 1.36,
    AUD: 1.52,
    CNY: 7.23,
    CHF: 0.91,
    SGD: 1.35,
    NZD: 1.67,
    HKD: 7.83,
    KRW: 1350.00,
    BRL: 5.15,
    ZAR: 18.50,
    RUB: 92.50,
    MXN: 16.50
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
        const rate = RATES[currency] || 1;
        return amount * rate;
    };

    const convertToUSD = (amount) => {
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
