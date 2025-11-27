'use client';

import { ArrowUpRight } from 'lucide-react';

export default function StatCard({ icon: Icon, title, subtitle, color = 'primary' }) {
    const colorClasses = {
        primary: 'bg-primary text-background',
        blue: 'bg-info text-white',
        green: 'bg-success text-white',
        red: 'bg-error text-white',
        purple: 'bg-purple-500 text-white',
        pink: 'bg-pink-500 text-white',
    };

    return (
        <div className="card p-6 flex flex-col items-start gap-4 hover:bg-surface-elevated transition-colors cursor-pointer group">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[color]} bg-opacity-20 text-opacity-100`}>
                <Icon size={24} className={color === 'primary' ? 'text-background' : 'text-white'} />
            </div>
            <div>
                <h3 className="font-bold text-text-primary mb-1">{title}</h3>
                <p className="text-sm text-text-secondary">{subtitle}</p>
            </div>
        </div>
    );
}
