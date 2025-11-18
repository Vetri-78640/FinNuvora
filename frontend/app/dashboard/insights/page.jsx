'use client';

import { useEffect, useState } from 'react';
import { insightsAPI, transactionAPI } from '@/lib/api';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';

const defaultForm = {
  startDate: '',
  endDate: '',
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

const formatInsightText = (text) => {
  if (!text) return [];
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
};

export default function InsightsPage() {
  useProtectedRoute();

  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState('');
  const [insights, setInsights] = useState('');
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setHistoryLoading(true);
        const [{ data: historyRes }, { data: transactionsRes }] =
          await Promise.all([
            insightsAPI.getHistory(),
            transactionAPI.getTransactions({ limit: 5 }),
          ]);
        setHistory(historyRes.history || []);
        setRecentTransactions(transactionsRes.transactions || []);
      } catch (err) {
        console.error('Failed to load insight history', err);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, []);

  const handleGenerateInsights = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      setInsights('');
      setStats(null);

      const { data } = await insightsAPI.generateInsights(
        form.startDate || undefined,
        form.endDate || undefined
      );

      setInsights(data.insights);
      setStats(data.stats);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Unable to generate insights right now. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            AI Financial Insights
          </h2>
          <p className="text-slate-400 mt-2">
            Generate personalized summaries and recommendations using your
            financial data.
          </p>
        </div>
        <div className="card px-5 py-4 text-sm text-slate-300">
          <p className="font-semibold text-white mb-1">How it works</p>
          <p>
            Pick a date range and FinNuvora will analyze your transactions to
            surface opportunities, risks, and actionable insights.
          </p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold text-white mb-4">
          Choose a date range
        </h3>
        <form
          onSubmit={handleGenerateInsights}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div>
            <label className="text-slate-300 text-sm font-medium mb-2 block">
              Start date
            </label>
            <input
              className="input-field"
              type="date"
              value={form.startDate}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, startDate: event.target.value }))
              }
            />
          </div>
          <div>
            <label className="text-slate-300 text-sm font-medium mb-2 block">
              End date
            </label>
            <input
              className="input-field"
              type="date"
              value={form.endDate}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, endDate: event.target.value }))
              }
            />
          </div>
          <div className="flex items-end gap-3 md:col-span-2">
            <button
              type="submit"
              className="btn-primary w-full md:w-auto"
              disabled={loading}
            >
              {loading ? 'Generating insights...' : 'Generate insights'}
            </button>
            {(form.startDate || form.endDate) && (
              <button
                type="button"
                className="btn-ghost px-4 py-3"
                onClick={() => setForm(defaultForm)}
                disabled={loading}
              >
                Clear dates
              </button>
            )}
          </div>
        </form>
        <p className="text-slate-500 text-sm mt-3">
          Leave the date fields empty to analyze your entire transaction
          history.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 text-red-200 px-4 py-3">
          {error}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card px-5 py-4">
            <p className="text-slate-400 text-sm">Total income</p>
            <p className="text-2xl font-semibold text-emerald-300 mt-1">
              {formatCurrency(stats.totalIncome)}
            </p>
          </div>
          <div className="card px-5 py-4">
            <p className="text-slate-400 text-sm">Total expenses</p>
            <p className="text-2xl font-semibold text-red-300 mt-1">
              {formatCurrency(stats.totalExpense)}
            </p>
          </div>
          <div className="card px-5 py-4">
            <p className="text-slate-400 text-sm">Investments</p>
            <p className="text-2xl font-semibold text-blue-300 mt-1">
              {formatCurrency(stats.totalInvestment)}
            </p>
          </div>
          <div className="card px-5 py-4">
            <p className="text-slate-400 text-sm">Savings rate</p>
            <p
              className={`text-2xl font-semibold mt-1 ${
                stats.savingsRate >= 0
                  ? 'text-emerald-300'
                  : 'text-red-300'
              }`}
            >
              {stats.savingsRate}%
            </p>
          </div>
        </div>
      )}

      {insights && (
        <div className="card border border-blue-500/30 bg-blue-500/5 space-y-4">
          <h3 className="text-xl font-semibold text-white">
            Personalized insights
          </h3>
          <div className="space-y-3 text-slate-200 leading-relaxed">
            {formatInsightText(insights).map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card h-full">
          <h3 className="text-lg font-semibold text-white mb-4">
            Recent transactions
          </h3>
          {recentTransactions.length === 0 ? (
            <p className="text-slate-500 text-sm">No recent transactions</p>
          ) : (
            <ul className="space-y-3">
              {recentTransactions.map((transaction) => (
                <li
                  key={transaction._id}
                  className="glass border border-slate-800/60 px-4 py-3 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <p className="text-white font-medium">
                      {transaction.category?.name || 'Uncategorized'}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.type === 'income'
                          ? 'text-emerald-300'
                          : transaction.type === 'expense'
                          ? 'text-red-300'
                          : 'text-blue-300'
                      }`}
                    >
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-slate-500 text-xs capitalize">
                      {transaction.type}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Price history snapshots
            </h3>
            <span className="text-slate-500 text-xs">
              Latest 10 entries
            </span>
          </div>
          {historyLoading ? (
            <p className="text-slate-500 text-sm">Loading price history...</p>
          ) : history.length === 0 ? (
            <p className="text-slate-500 text-sm">No history available yet.</p>
          ) : (
            <ul className="space-y-3">
              {history.map((entry) => (
                <li
                  key={entry._id}
                  className="glass border border-slate-800/60 px-4 py-3 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <p className="text-white font-semibold">{entry.symbol}</p>
                    <p className="text-slate-500 text-xs">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-blue-300 font-semibold">
                    {formatCurrency(entry.price)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}


