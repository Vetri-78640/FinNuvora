'use client';

import { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useCurrency } from '@/lib/contexts/CurrencyContext';

export default function ExpenditureChart({ transactions = [] }) {
    const { formatCurrency } = useCurrency();

    const data = useMemo(() => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        // Initialize array for all days in month
        const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
            name: (i + 1).toString(), // Day number
            value: 0
        }));

        transactions.forEach(tx => {
            if (tx.type === 'expense') {
                const txDate = new Date(tx.date);
                if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
                    const day = txDate.getDate();
                    if (dailyData[day - 1]) {
                        dailyData[day - 1].value += tx.amount;
                    }
                }
            }
        });

        return dailyData;
    }, [transactions]);

    const totalSpend = useMemo(() => {
        return data.reduce((sum, item) => sum + item.value, 0);
    }, [data]);

    return (
        <div className="card p-6 h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-text-primary">This Month's Expenditures</h3>
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#71717a', fontSize: 12 }}
                            dy={10}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                            itemStyle={{ color: '#fbbf24' }}
                            formatter={(value) => [formatCurrency(value), 'Spend']}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#fbbf24"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 flex items-center justify-between">
                <div>
                    <div className="text-2xl font-bold text-text-primary">{formatCurrency(totalSpend)}</div>
                    <div className="text-sm text-text-secondary">Total Spend</div>
                </div>
            </div>
        </div>
    );
}
