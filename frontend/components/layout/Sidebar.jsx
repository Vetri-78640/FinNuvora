'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    CreditCard,
    Target,
    Briefcase,
    Sparkles,
    User,
    LogOut
} from 'lucide-react';

const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', href: '/dashboard/transactions', icon: CreditCard },
    { name: 'Goals', href: '/dashboard/goals', icon: Target },
    { name: 'Portfolios', href: '/dashboard/portfolios', icon: Briefcase },
    { name: 'AI Advisor', href: '/dashboard/insights', icon: Sparkles },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
];

export default function Sidebar({ onLogout }) {
    const pathname = usePathname();

    return (
        <div className="w-72 bg-[#000000] rounded-[40px] flex flex-col h-[calc(100vh-2rem)] m-4 shadow-2xl z-10">
            {/* Logo */}
            <div className="mb-8 px-8 pt-8">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <img src="/logo.svg" alt="FinNuvora Logo" className="w-8 h-8" />
                    <span className="text-2xl font-bold text-white tracking-tight">FinNuvora</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
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
                    onClick={onLogout}
                    className="flex items-center gap-4 px-6 py-4 w-full rounded-full text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                >
                    <LogOut size={24} />
                    <span className="text-lg font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
}
