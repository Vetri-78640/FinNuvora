'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { removeCookie } from '@/lib/cookies';

const menuItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Portfolios', href: '/dashboard/portfolios' },
  { name: 'Transactions', href: '/dashboard/transactions' },
  { name: 'Goals', href: '/dashboard/goals' },
  { name: 'Insights', href: '/dashboard/insights' },
  { name: 'Profile', href: '/dashboard/profile' },
];

const pageMeta = {
  '/dashboard': {
    title: 'Dashboard',
    description: 'Financial Portfolio Management',
  },
  '/dashboard/portfolios': {
    title: 'Portfolios',
    description: 'Organize and evaluate your investment holdings.',
  },
  '/dashboard/transactions': {
    title: 'Transactions',
    description: 'Analyze income, expenses, and investments.',
  },
  '/dashboard/goals': {
    title: 'Financial Goals',
    description: 'Track your savings milestones and progress.',
  },
  '/dashboard/insights': {
    title: 'AI Insights',
    description: 'AI-generated financial recommendations and health checks.',
  },
  '/dashboard/profile': {
    title: 'Profile & Preferences',
    description: 'Manage your personal settings and security.',
  },
};

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Protect all dashboard routes
  useProtectedRoute();

  const activeMetaKey =
    Object.keys(pageMeta).find((key) => {
      if (key === '/dashboard') {
        return pathname === '/dashboard';
      }
      return pathname === key || pathname.startsWith(`${key}/`);
    }) || '/dashboard';

  const { title, description } = pageMeta[activeMetaKey];

  const handleLogout = () => {
    removeCookie('authToken');
    removeCookie('userData');
    router.push('/auth/login');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
      {/* Sidebar - Apple Style */}
      <div
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-xl border-r border-slate-800/50 transition-all duration-500 flex flex-col shadow-2xl`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-800/30 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 flex-1">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all">
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-white text-base tracking-tight">FinNuvora</span>
                <span className="text-xs text-blue-400/70">Portfolio</span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/10 text-white border border-blue-500/30 shadow-lg shadow-blue-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {/* Active indicator dot */}
                {isActive ? (
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full shadow-lg shadow-blue-400/50"></div>
                ) : (
                  <div className="w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 bg-slate-600 transition-opacity"></div>
                )}
                {isSidebarOpen && <span className="font-medium text-sm tracking-tight">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800/30 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 rounded-2xl text-red-400/80 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300 font-medium text-sm border border-transparent hover:border-red-500/20 group"
          >
            {isSidebarOpen ? 'Logout' : '⟨'}
          </button>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full px-4 py-3 rounded-2xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all duration-300 font-medium text-sm"
          >
            {isSidebarOpen ? '⟨' : '⟩'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
        {/* Header */}
        <header className="bg-gradient-to-r from-slate-900/90 to-slate-950/90 backdrop-blur-md border-b border-slate-800/30 px-8 py-6 shadow-md">
          <div className="max-w-7xl">
            <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
            <p className="text-slate-400 text-sm mt-2">{description}</p>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
