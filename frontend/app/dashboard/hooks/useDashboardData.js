import { useState, useEffect } from 'react';
import { transactionAPI, portfolioAPI, userAPI } from '@/lib/api';

export function useDashboardData() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        transactions: [],
        portfolios: [],
        userProfile: null,
        stats: {
            income: 0,
            expense: 0,
            investment: 0,
            balance: 0
        }
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [txRes, portRes, userRes] = await Promise.all([
                    transactionAPI.getTransactions({ limit: 5 }),
                    portfolioAPI.getPortfolios(),
                    userAPI.getProfile()
                ]);

                const transactions = txRes.data.transactions || [];
                const portfolios = portRes.data.portfolios || [];
                const userProfile = userRes;

                // Calculate stats
                const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
                const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
                const investment = transactions.filter(t => t.type === 'investment').reduce((sum, t) => sum + t.amount, 0);

                setData({
                    transactions,
                    portfolios,
                    userProfile,
                    stats: {
                        income,
                        expense,
                        investment,
                        balance: userRes.data.user.accountBalance || 0
                    }
                });
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return { ...data, loading };
}
