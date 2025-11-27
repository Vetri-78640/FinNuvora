'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Calendar,
  SlidersHorizontal,
  Search,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  MoreHorizontal,
  ArrowUp,
  Download,
  Upload,
  RefreshCw,
  Wallet,
  PieChart
} from 'lucide-react';
import ExpenditureChart from '@/components/dashboard/ExpenditureChart';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { transactionAPI, portfolioAPI, userAPI } from '@/lib/api';
import Link from 'next/link';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

export default function DashboardPage() {
  useProtectedRoute();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [stats, setStats] = useState({
    income: 0,
    expense: 0,
    investment: 0,
    balance: 0
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [txRes, portRes, userRes] = await Promise.all([
          transactionAPI.getTransactions({ limit: 5 }),
          portfolioAPI.getPortfolios(),
          userAPI.getProfile()
        ]);

        setTransactions(txRes.data.transactions || []);
        setPortfolios(portRes.data.portfolios || []);
        setUserProfile(userRes);

        // Calculate stats from transactions (simplified logic for demo)
        // In a real app, backend should provide aggregated stats
        const allTx = txRes.data.transactions || [];
        const income = allTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = allTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const investment = allTx.filter(t => t.type === 'investment').reduce((sum, t) => sum + t.amount, 0);

        setStats({
          income,
          expense,
          investment,
          balance: userRes.accountBalance || 0
        });

      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const recentTransactions = transactions.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Top Actions Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/transactions" className="flex items-center gap-2 px-6 py-3 bg-[#000000] rounded-full text-white hover:bg-white/10 transition-colors text-sm font-medium">
            <Plus size={18} />
            <span>Add Transaction</span>
          </Link>
          <div className="flex items-center gap-2 px-6 py-3 bg-[#000000] rounded-full text-white text-sm font-medium">
            <Calendar size={18} className="text-gray-400" />
            <span>{new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="w-12 h-12 flex items-center justify-center rounded-full bg-[#000000] text-gray-400 hover:text-white transition-colors">
            <SlidersHorizontal size={20} />
          </button>
          <button className="w-12 h-12 flex items-center justify-center rounded-full bg-[#000000] text-gray-400 hover:text-white transition-colors">
            <Search size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Main Column */}
        <div className="xl:col-span-2 space-y-6">

          {/* 4 Stat Cards (Real Data) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Wallet, title: "Total Balance", value: formatCurrency(stats.balance), bg: "bg-[#000000]", iconBg: "bg-yellow-100 text-yellow-600" },
              { icon: TrendingUp, title: "Total Income", value: formatCurrency(stats.income), bg: "bg-[#000000]", iconBg: "bg-green-100 text-green-600" },
              { icon: TrendingDown, title: "Total Expenses", value: formatCurrency(stats.expense), bg: "bg-[#000000]", iconBg: "bg-red-100 text-red-600" },
              { icon: PieChart, title: "Investments", value: formatCurrency(stats.investment), bg: "bg-[#000000]", iconBg: "bg-blue-100 text-blue-600" },
            ].map((stat, i) => (
              <div key={i} className={`${stat.bg} p-5 rounded-3xl flex flex-col items-center text-center gap-3 hover:bg-white/5 transition-colors cursor-pointer group`}>
                <div className={`w-12 h-12 rounded-full ${stat.iconBg} flex items-center justify-center mb-1`}>
                  <stat.icon size={20} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-gray-400 text-xs uppercase tracking-wider">{stat.title}</h3>
                  <p className="font-bold text-white text-lg">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Expenditures Chart */}
          <div className="bg-[#000000] p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-white text-lg">Expenditure Analytics</h3>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
            <ExpenditureChart />
            <div className="flex justify-between items-center mt-6 px-2">
              <div className="text-2xl font-bold text-white">{formatCurrency(stats.expense)}</div>
              <div className="text-xs text-gray-400">Total expenses this period</div>
            </div>
          </div>

          {/* Transaction History (Real Data) */}
          <div className="bg-[#000000] p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-white">Recent Transactions</h3>
              <Link href="/dashboard/transactions">
                <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
                  <ArrowUpRight size={16} />
                </button>
              </Link>
            </div>
            <div className="space-y-4">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No transactions yet. Start by adding one!
                </div>
              ) : (
                recentTransactions.map((tx, i) => (
                  <div key={tx._id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-green-500/20 text-green-500' :
                        tx.type === 'expense' ? 'bg-red-500/20 text-red-500' :
                          'bg-blue-500/20 text-blue-500'
                        }`}>
                        {tx.type === 'income' ? <Download size={18} /> :
                          tx.type === 'expense' ? <Upload size={18} /> :
                            <RefreshCw size={18} />}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{tx.description || 'Untitled Transaction'}</div>
                        <div className="text-xs text-gray-400">{new Date(tx.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className={`font-bold ${tx.type === 'income' ? 'text-green-400' :
                      tx.type === 'expense' ? 'text-white' : 'text-blue-400'
                      }`}>
                      {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">

          {/* Investments (Real Data) */}
          <div className="bg-[#000000] p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-white">Your Portfolios</h3>
              <Link href="/dashboard/portfolios">
                <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
                  <ArrowUpRight size={16} />
                </button>
              </Link>
            </div>
            <div className="space-y-4">
              {portfolios.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No portfolios created yet.
                </div>
              ) : (
                portfolios.slice(0, 4).map((item, i) => (
                  <div key={item._id} className="bg-[#2C2C2E] p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-black">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{item.name}</div>
                        <div className="text-xs text-gray-400">{item.assets?.length || 0} Assets</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xs text-white">{formatCurrency(item.totalValue)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Total Balance Summary */}
          <div className="bg-[#000000] p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-400 text-sm">Total Balance</span>
              <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
                <ArrowUpRight size={16} />
              </button>
            </div>
            <div className="text-3xl font-bold text-white mb-6">{formatCurrency(stats.balance)}</div>
            <div className="flex gap-3 mb-8">
              <Link href="/dashboard/transactions" className="flex-1 py-3 bg-yellow-100 rounded-full flex items-center justify-center text-black hover:bg-yellow-200 transition-colors" title="Add Income">
                <Download size={18} />
              </Link>
              <Link href="/dashboard/transactions" className="flex-1 py-3 bg-blue-100 rounded-full flex items-center justify-center text-black hover:bg-blue-200 transition-colors" title="Add Expense">
                <Upload size={18} />
              </Link>
              <Link href="/dashboard/portfolios" className="flex-1 py-3 bg-green-100 rounded-full flex items-center justify-center text-black hover:bg-green-200 transition-colors" title="Invest">
                <TrendingUp size={18} />
              </Link>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Monthly Spending Limit</span>
              </div>
              <div className="w-full h-12 bg-[#2C2C2E] rounded-full p-1 flex items-center relative">
                <div className="h-full bg-white rounded-full" style={{ width: `${Math.min((stats.expense / 5000) * 100, 100)}%` }} />
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-bold text-white">{formatCurrency(stats.expense)}</span>
                <span className="text-[10px] text-gray-500">of $5,000.00 limit</span>
              </div>
            </div>
          </div>

          {/* Currency Rates (Static for now, but cleaner) */}
          <div className="space-y-3">
            <div className="p-4 bg-[#000000] rounded-2xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2C2C2E] flex items-center justify-center text-xs font-bold text-gray-400">USD</div>
                <span className="font-bold text-white">1.00</span>
              </div>
              <span className="text-green-400 text-sm flex items-center gap-1">
                Base Currency
              </span>
            </div>
            <div className="p-4 bg-[#000000] rounded-2xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2C2C2E] flex items-center justify-center text-xs font-bold text-gray-400">EUR</div>
                <span className="font-bold text-white">0.92</span>
              </div>
              <span className="text-green-400 text-sm flex items-center gap-1">
                <ArrowUp size={12} /> Live Rate
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
