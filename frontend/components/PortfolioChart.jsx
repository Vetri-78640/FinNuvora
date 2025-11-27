'use client';

import { useMemo } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

const formatCurrency = (value) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);

export default function PortfolioChart({ portfolios }) {
    const data = useMemo(() => {
        if (!portfolios || portfolios.length === 0) return [];

        // Calculate total value per portfolio
        return portfolios.map(portfolio => {
            const totalValue = (portfolio.holdings || []).reduce((sum, holding) => {
                return sum + (holding.quantity * (holding.currentPrice || holding.buyPrice));
            }, 0);

            return {
                name: portfolio.name,
                value: totalValue
            };
        }).filter(item => item.value > 0);
    }, [portfolios]);

    const assetAllocation = useMemo(() => {
        if (!portfolios || portfolios.length === 0) return [];

        const assets = {};

        portfolios.forEach(portfolio => {
            (portfolio.holdings || []).forEach(holding => {
                const value = holding.quantity * (holding.currentPrice || holding.buyPrice);
                if (assets[holding.symbol]) {
                    assets[holding.symbol] += value;
                } else {
                    assets[holding.symbol] = value;
                }
            });
        });

        return Object.entries(assets)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6); // Top 6 assets
    }, [portfolios]);

    if (data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800/50">
                <p>Add holdings to see charts</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Portfolio Distribution */}
            <div className="card bg-slate-900/50 border-slate-800/50">
                <h3 className="text-lg font-semibold text-white mb-4">Portfolio Value</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                formatter={(value) => formatCurrency(value)}
                                cursor={{ fill: '#334155', opacity: 0.2 }}
                            />
                            <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Asset Allocation */}
            <div className="card bg-slate-900/50 border-slate-800/50">
                <h3 className="text-lg font-semibold text-white mb-4">Top Assets</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={assetAllocation}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {assetAllocation.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                formatter={(value) => formatCurrency(value)}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
