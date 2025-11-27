'use client';

import { ArrowUpRight, ArrowDownLeft, RefreshCw, MoreHorizontal } from 'lucide-react';

export default function BalanceCard({ totalBalance }) {
    return (
        <div className="card p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <p className="text-text-secondary text-sm mb-1">Total Balance</p>
                    <h2 className="text-4xl font-bold text-text-primary">${totalBalance}</h2>
                </div>
                <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface transition-colors">
                    <ArrowUpRight size={20} />
                </button>
            </div>

            <div className="flex items-center gap-4">
                <button className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-background transition-all">
                        <ArrowUpRight size={20} />
                    </div>
                    <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary">Send</span>
                </button>
                <button className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 rounded-full bg-info-light text-info flex items-center justify-center group-hover:bg-info group-hover:text-white transition-all">
                        <ArrowDownLeft size={20} />
                    </div>
                    <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary">Receive</span>
                </button>
                <button className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 rounded-full bg-success-light text-success flex items-center justify-center group-hover:bg-success group-hover:text-white transition-all">
                        <RefreshCw size={20} />
                    </div>
                    <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary">Swap</span>
                </button>
                <button className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 rounded-full bg-surface-elevated text-text-secondary flex items-center justify-center group-hover:bg-text-primary group-hover:text-background transition-all">
                        <MoreHorizontal size={20} />
                    </div>
                    <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary">More</span>
                </button>
            </div>
        </div>
    );
}
