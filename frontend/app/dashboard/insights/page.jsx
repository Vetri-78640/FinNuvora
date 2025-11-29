'use client';

import { useEffect, useState } from 'react';
import { insightsAPI, transactionAPI } from '@/lib/api';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { useCurrency } from '@/lib/contexts/CurrencyContext';
import { Sparkles, Calendar, TrendingUp, TrendingDown, DollarSign, PieChart, ArrowRight, Activity } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import CustomDatePicker from '@/components/ui/DatePicker';
import Button from '@/components/ui/Button';

const defaultForm = {
  startDate: null,
  endDate: null,
};

const formatInsightText = (text) => {
  if (!text) return [];
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
};

export default function InsightsPage() {
  useProtectedRoute();
  const { formatCurrency } = useCurrency();

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

      // Convert Date objects to ISO strings for API if needed, or keep as is if API handles it
      // Assuming API expects YYYY-MM-DD string or ISO string
      const startDateStr = form.startDate ? form.startDate.toISOString().split('T')[0] : undefined;
      const endDateStr = form.endDate ? form.endDate.toISOString().split('T')[0] : undefined;

      const { data } = await insightsAPI.generateInsights(
        startDateStr,
        endDateStr
      );

      setInsights(data.insights);
      setStats(data.stats);
    } catch (err) {
      // ... (keep error handling)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* ... (keep header) */}

      {/* Date Selection Card */}
      <div className="card p-6">
        <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-primary" /> Analysis Period
        </h3>
        <form
          onSubmit={handleGenerateInsights}
          className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
        >
          <div className="md:col-span-4">
            <label className="text-xs text-text-secondary mb-1 block">Start Date</label>
            <CustomDatePicker
              selected={form.startDate}
              onChange={(date) => setForm(prev => ({ ...prev, startDate: date }))}
              placeholder="dd/mm/yyyy"
            />
          </div>
          <div className="md:col-span-4">
            <label className="text-xs text-text-secondary mb-1 block">End Date</label>
            <CustomDatePicker
              selected={form.endDate}
              onChange={(date) => setForm(prev => ({ ...prev, endDate: date }))}
              placeholder="dd/mm/yyyy"
              minDate={form.startDate}
            />
          </div>
          <div className="md:col-span-4 flex gap-3">
            <Button
              type="submit"
              className="flex-1"
              isLoading={loading}
              disabled={loading}
            >
              Generate Insights
            </Button>
            {(form.startDate || form.endDate) && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setForm(defaultForm)}
                disabled={loading}
              >
                Clear
              </Button>
            )}
          </div>
        </form>
        <p className="text-text-secondary text-xs mt-3 flex items-center gap-1">
          <Activity size={12} />
          Leave dates empty to analyze your entire transaction history.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-full bg-error/10 border border-error/20 text-error text-sm">
          {error}
        </div>
      )}

      {/* Stats Section */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={TrendingUp}
            title="Total Income"
            subtitle={formatCurrency(stats.totalIncome)}
            color="green"
          />
          <StatCard
            icon={TrendingDown}
            title="Total Expenses"
            subtitle={formatCurrency(stats.totalExpense)}
            color="red"
          />
          <StatCard
            icon={DollarSign}
            title="Investments"
            subtitle={formatCurrency(stats.totalInvestment)}
            color="blue"
          />
          <StatCard
            icon={PieChart}
            title="Savings Rate"
            subtitle={`${stats.savingsRate}%`}
            color={stats.savingsRate >= 0 ? "green" : "red"}
          />
        </div>
      )}

      {/* Insights Result */}
      {insights && (
        <div className="card p-8 border-primary/30 bg-gradient-to-br from-surface to-surface-elevated relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

          <h3 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
            <Sparkles className="text-primary animate-pulse" size={24} />
            Your Financial Analysis
          </h3>

          <div className="space-y-4 text-text-secondary leading-relaxed relative z-10">
            {formatInsightText(insights).map((line, index) => {
              // Handle Headers
              if (line.startsWith('###')) {
                return (
                  <h4 key={index} className="text-lg font-bold text-primary mt-6 mb-2 border-b border-border pb-2">
                    {line.replace(/###/g, '').trim()}
                  </h4>
                );
              }

              // Handle Bullet Points
              if (line.startsWith('* ') || line.startsWith('- ')) {
                const content = line.substring(2);
                return (
                  <div key={index} className="flex gap-3 ml-2 mb-2 group">
                    <span className="text-primary mt-1.5 group-hover:scale-125 transition-transform">•</span>
                    <p className="text-text-primary/90">
                      {content.split(/(\*\*.*?\*\*)/).map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      })}
                    </p>
                  </div>
                );
              }

              // Handle Regular Paragraphs with Bold
              return (
                <p key={index} className="text-text-primary/80">
                  {line.split(/(\*\*.*?\*\*)/).map((part, i) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
                    }
                    return part;
                  })}
                </p>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="card p-6 h-full">
          <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center justify-between">
            Recent Transactions
            <ArrowRight size={16} className="text-text-secondary" />
          </h3>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-secondary text-sm">No recent transactions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between p-3 rounded-full bg-surface-elevated/50 hover:bg-surface-elevated transition-colors border border-transparent hover:border-primary/20"
                >
                  <div>
                    <p className="text-text-primary font-medium">
                      {transaction.category?.name || 'Uncategorized'}
                    </p>
                    <p className="text-text-secondary text-xs mt-0.5">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${transaction.type === 'income'
                        ? 'text-success'
                        : transaction.type === 'expense'
                          ? 'text-error'
                          : 'text-blue-400'
                        }`}
                    >
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-text-secondary text-[10px] uppercase tracking-wider">
                      {transaction.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price History */}
        <div className="card p-6 h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text-primary">
              Market Snapshots
            </h3>
            <span className="text-text-secondary text-xs bg-surface-elevated px-2 py-1 rounded-full">
              Latest 10 entries
            </span>
          </div>
          {historyLoading ? (
            <div className="text-center py-8">
              <p className="text-text-secondary text-sm animate-pulse">Loading price history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-secondary text-sm">No history available yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => (
                <div
                  key={entry._id}
                  className="flex items-center justify-between p-3 rounded-full bg-surface-elevated/50 border border-transparent hover:border-primary/20 transition-colors"
                >
                  <div>
                    <p className="text-text-primary font-bold">{entry.symbol}</p>
                    <p className="text-text-secondary text-xs mt-0.5">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-primary font-mono font-bold">
                    {formatCurrency(entry.price)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


