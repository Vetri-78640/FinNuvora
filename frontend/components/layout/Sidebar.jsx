'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    CreditCard,
    Target,
    Briefcase,
    Sparkles,
    User,
    LogOut,
    X
} from 'lucide-react';

const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', href: '/dashboard/transactions', icon: CreditCard },
    { name: 'Goals', href: '/dashboard/goals', icon: Target },
    { name: 'Portfolios', href: '/dashboard/portfolios', icon: Briefcase },
    { name: 'AI Advisor', href: '/dashboard/insights', icon: Sparkles },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
];

export default function Sidebar({ onLogout, isOpen, onClose }) {
    const pathname = usePathname();

    const handleNavClick = () => {
        // Close sidebar on mobile when navigating
        if (onClose) onClose();
    };

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:relative z-50 lg:z-10
                w-72 bg-[#000000] flex flex-col shadow-2xl
                h-screen lg:h-[calc(100vh-2rem)]
                lg:m-4 lg:rounded-[40px]
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo + Close */}
                <div className="mb-8 px-8 pt-8 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-3" onClick={handleNavClick}>
                        <img src="/logo.svg" alt="FinNuvora Logo" className="w-8 h-8" />
                        <span className="text-2xl font-bold text-white tracking-tight">FinNuvora</span>
                    </Link>
                    {/* Close button - mobile only */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={handleNavClick}
                                className={`flex items-center gap-4 px-6 py-4 rounded-full transition-all duration-200 group ${isActive
                                    ? 'bg-[#FFF9C4] text-black font-bold'
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <item.icon
                                    size={24}
                                    className={isActive ? 'text-black' : 'text-gray-500 group-hover:text-white'}
                                />
                                <span className="text-lg font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="mt-auto px-4 pb-8">
                    <button
                        onClick={() => { onLogout(); handleNavClick(); }}
                        className="flex items-center gap-4 px-6 py-4 w-full rounded-full text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                    >
                        <LogOut size={24} />
                        <span className="text-lg font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
}
