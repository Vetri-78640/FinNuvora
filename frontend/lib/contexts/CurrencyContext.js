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
    AUD: 1.52
};

const SYMBOLS = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$'
};

export function CurrencyProvider({ children }) {
    const { user, checkAuth } = useAuth();
    const [currency, setCurrency] = useState('USD');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.currency) {
            setCurrency(user.currency);
        }
        setLoading(false);
    }, [user]);

    const updateCurrency = async (newCurrency) => {
        try {
            setLoading(true);
            await userAPI.updateProfile({ currency: newCurrency });
            setCurrency(newCurrency);
            await checkAuth(); // Refresh user data
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

    return (
        <CurrencyContext.Provider value={{
            currency,
            updateCurrency,
            formatCurrency,
            convertAmount,
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
