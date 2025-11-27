'use client';

export default function InvestmentList() {
    const investments = [
        { name: 'Hondo', symbol: 'H', value: '7.242', change: '+7.34%', period: 'Per month', color: 'bg-yellow-400' },
        { name: 'Samsen', symbol: 'S', value: '4.384', change: '-3.85%', period: 'Per month', color: 'bg-blue-400' },
        { name: 'Nikom', symbol: 'N', value: '0.539', change: '-1.48%', period: 'Per month', color: 'bg-green-400' },
        { name: 'Pasion', symbol: 'P', value: '0.539', change: '-2.48%', period: 'Per month', color: 'bg-red-400' },
    ];

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-text-primary">Investments</h3>
                <button className="p-2 rounded-full border border-border hover:bg-surface transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                </button>
            </div>

            {investments.map((item, idx) => (
                <div key={idx} className={`p-4 rounded-xl flex items-center justify-between ${item.color === 'bg-yellow-400' ? 'bg-primary/10' :
                        item.color === 'bg-blue-400' ? 'bg-info-light' :
                            item.color === 'bg-green-400' ? 'bg-success-light' : 'bg-error-light'
                    }`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-background ${item.color}`}>
                            {item.symbol}
                        </div>
                        <div>
                            <div className="font-bold text-text-primary">{item.name}</div>
                            <div className="text-sm text-text-secondary">{item.value}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`font-bold ${item.change.startsWith('+') ? 'text-success' : 'text-error'}`}>
                            {item.change}
                        </div>
                        <div className="text-xs text-text-secondary">{item.period}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
