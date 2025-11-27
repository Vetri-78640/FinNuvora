'use client';

import { Search, Bell, Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/contexts/ThemeContext';

export default function TopBar({ user, title }) {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <div className="h-20 px-8 flex items-center justify-between border-b border-border bg-background/50 backdrop-blur-xl sticky top-0 z-10">
            {/* Title/Breadcrumb */}
            <div>
                <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2 bg-surface border border-border rounded-full text-sm text-text-primary focus:outline-none focus:border-primary w-64 transition-colors"
                    />
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Notifications */}
                <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-background"></span>
                </button>

                {/* Settings */}
                <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface transition-colors">
                    <Settings size={20} />
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-4 border-l border-border">
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-bold text-text-primary">{user?.name || 'User'}</div>
                        <div className="text-xs text-text-secondary">Welcome Back!</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-surface-elevated border border-border overflow-hidden">
                        {/* Placeholder Avatar */}
                        <div className="w-full h-full flex items-center justify-center text-text-secondary font-bold">
                            {user?.name?.[0] || 'U'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
