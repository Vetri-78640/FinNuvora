'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 2000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
    { name: 'Jul', value: 3490 },
    { name: 'Aug', value: 2000 },
    { name: 'Sep', value: 2780 },
    { name: 'Oct', value: 1890 },
    { name: 'Nov', value: 2390 },
    { name: 'Dec', value: 3490 },
];

export default function ExpenditureChart() {
    return (
        <div className="card p-6 h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-text-primary">This Year's Expenditures</h3>
                <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
                    </button>
                    <button className="p-2 rounded-lg bg-surface-elevated text-text-secondary hover:text-text-primary transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                    </button>
                </div>
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
                    <div className="text-2xl font-bold text-text-primary">$34,742.00</div>
                    <div className="text-sm text-text-secondary">Total Spend</div>
                </div>
                <div className="text-sm text-success flex items-center gap-1">
                    <span>↓ $54.00</span>
                    <span className="text-text-secondary">less than last month</span>
                </div>
            </div>
        </div>
    );
}
