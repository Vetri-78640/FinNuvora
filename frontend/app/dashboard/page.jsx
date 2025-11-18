'use client';

import { useEffect, useState } from 'react';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { transactionAPI, goalAPI, portfolioAPI } from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [goals, setGoals] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Protect this route - redirect to login if no token
  useProtectedRoute();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, goalsRes, portfoliosRes] = await Promise.all([
          transactionAPI.getStats(),
          goalAPI.getGoals({ status: 'active' }),
          portfolioAPI.getPortfolios(),
        ]);

        setStats(statsRes.data.stats);
        setGoals(goalsRes.data.goals);
        setPortfolios(portfoliosRes.data.portfolios);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-text-secondary text-lg">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-lg border border-red-500 bg-red-900 bg-opacity-20 text-red-400">
        <p className="font-semibold mb-1">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Stats Grid - Apple Style */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Income', value: stats.totalIncome, color: 'from-blue-400 to-cyan-400' },
            { label: 'Total Expenses', value: stats.totalExpense, color: 'from-orange-400 to-red-400' },
            { label: 'Investments', value: stats.totalInvestment, color: 'from-emerald-400 to-teal-400' },
            { label: 'Net Amount', value: stats.netAmount, color: stats.netAmount >= 0 ? 'from-green-400 to-emerald-400' : 'from-orange-400 to-red-400' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="card group hover:shadow-2xl hover:shadow-blue-500/20"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} opacity-20 group-hover:opacity-30 transition-opacity`}></div>
              </div>
              <p className="text-slate-400 text-sm font-medium mb-2">{stat.label}</p>
              <p className={`text-3xl font-bold tracking-tight bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                ${Math.abs(stat.value || 0).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Portfolios Section */}
      {portfolios.length > 0 && (
        <div className="card">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-1">Your Portfolios</h3>
            <p className="text-slate-400 text-sm">Manage and track your investment portfolios</p>
          </div>
          <div className="space-y-3">
            {portfolios.slice(0, 5).map((portfolio, idx) => (
              <div
                key={portfolio._id || portfolio.id || idx}
                className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-800/20 to-slate-800/10 border border-slate-800/30 hover:border-blue-500/30 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-cyan-500/5 transition-all duration-300 group cursor-pointer"
              >
                <div>
                  <p className="font-semibold text-white group-hover:text-blue-300 transition-colors">{portfolio.name}</p>
                  <p className="text-sm text-slate-400 mt-1">{portfolio.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-400">{portfolio.holdings?.length || 0} holdings</p>
                  <p className="text-xs text-slate-500 mt-1">Portfolio</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Goals Section */}
      {goals.length > 0 && (
        <div className="card">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-1">Active Goals</h3>
            <p className="text-slate-400 text-sm">Track your financial milestones</p>
          </div>
          <div className="space-y-6">
            {goals.slice(0, 3).map((goal, idx) => {
              const progressPercent = Math.min((goal.progress || 0), 100);
              return (
                <div key={goal._id || goal.id || idx} className="p-5 rounded-2xl bg-gradient-to-r from-slate-800/20 to-slate-800/10 border border-slate-800/30 hover:border-blue-500/30 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-semibold text-white text-lg">{goal.title}</p>
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm font-semibold border border-blue-500/30">
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800/50 rounded-full h-3 overflow-hidden mb-3">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full transition-all duration-500 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm text-slate-400">
                    <span>${goal.currentAmount?.toFixed(2) || '0.00'}</span>
                    <span className="text-slate-600">/</span>
                    <span>${goal.targetAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {portfolios.length === 0 && goals.length === 0 && (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30"></div>
          </div>
          <p className="text-white font-semibold text-lg mb-2">No data yet</p>
          <p className="text-slate-400">Create a portfolio or goal to get started</p>
        </div>
      )}
    </div>
  );
}
