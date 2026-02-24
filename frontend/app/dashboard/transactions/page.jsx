'use client';

import { useState, useMemo, useEffect } from 'react';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, Upload, Filter, Search, Trash2, Loader2 } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import { useCurrency } from '@/lib/contexts/CurrencyContext';

// Import our new Hook and Components
import { useTransactions } from './hooks/useTransactions';
import TransactionForm from '@/components/transactions/TransactionForm';
import TransactionTable from '@/components/transactions/TransactionTable';

export default function TransactionsPage() {
  useProtectedRoute();
  const { formatCurrency } = useCurrency();

  // Use Custom Hook for Logic
  const {
    transactions, categories, loading, error, success, pagination,
    filters, selectedIds, uploading,
    handleFilterChange, resetFilters, toggleSelection, toggleAll,
    deleteTransaction, bulkDelete, saveTransaction, uploadPDF,
    setSuccess, setError
  } = useTransactions();

  const [showFilters, setShowFilters] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFilterChange('search', currentSearchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentSearchTerm]);

  const onSearch = (e) => setCurrentSearchTerm(e.target.value);

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  const handleFormSubmit = async (formData) => {
    if (formData.categoryId === 'other' && !formData.customCategory) {
      setError('Please enter a custom category name.');
      return;
    }

    if (!formData.categoryId) {
      setError('Please choose a category.');
      return;
    }

    const isUpdate = !!editingTransaction;
    const success = await saveTransaction(formData, isUpdate, editingTransaction?._id);

    if (success) {
      setEditingTransaction(null);
    }
  };

  const handleManualDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction(id);
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedIds.size} transactions?`)) {
      await bulkDelete();
    }
  };

  const calculateSummary = useMemo(() => {
    if (!transactions.length) return { income: 0, expense: 0, investment: 0, net: 0 };
    return transactions.reduce(
      (acc, t) => {
        if (t.type === 'income') acc.income += t.amount;
        else if (t.type === 'expense') acc.expense += t.amount;
        else if (t.type === 'investment') acc.investment += t.amount;
        acc.net = acc.income - acc.expense;
        return acc;
      },
      { income: 0, expense: 0, investment: 0, net: 0 }
    );
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text-primary tracking-tight">Transactions</h2>
          <p className="text-text-secondary mt-1">Manage your financial activity</p>
        </div>
        <div className="flex gap-3">
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full hover:bg-red-500/20 transition-colors text-sm font-medium"
            >
              <Trash2 size={18} /> Delete ({selectedIds.size})
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3 bg-[#1C1C1E] rounded-full text-white hover:bg-white/10 transition-colors text-sm font-medium"
          >
            <Filter size={18} /> Filters
          </button>
          <label className={`flex items-center gap-2 px-6 py-3 bg-yellow-400 rounded-full text-black hover:bg-yellow-500 transition-colors text-sm font-bold cursor-pointer ${uploading ? 'opacity-70 cursor-wait' : ''}`}>
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            <span>{uploading ? 'Parsing...' : 'Import PDF'}</span>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => uploadPDF(e.target.files?.[0])}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={ArrowUpRight} title="Total Income" subtitle={formatCurrency(calculateSummary.income)} color="green" />
        <StatCard icon={ArrowDownRight} title="Total Expenses" subtitle={formatCurrency(calculateSummary.expense)} color="red" />
        <StatCard icon={TrendingUp} title="Investments" subtitle={formatCurrency(calculateSummary.investment)} color="blue" />
        <StatCard icon={Wallet} title="Net Balance" subtitle={formatCurrency(calculateSummary.net)} color={calculateSummary.net >= 0 ? 'primary' : 'red'} />
      </div>

      {/* Form Section */}
      <TransactionForm
        initialData={editingTransaction}
        categories={categories}
        onSubmit={handleFormSubmit}
        onCancel={handleCancelEdit}
        isLoading={loading && !!editingTransaction} // Rough loading state proxy
      />

      {/* Filters Section */}
      {showFilters && (
        <div className="card p-6 animate-in slide-in-from-top-4 fade-in duration-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-text-primary">Filters</h3>
            <button onClick={resetFilters} className="text-sm text-primary hover:underline">Reset All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
              <input
                className="input-field w-full pl-10"
                placeholder="Search..."
                value={currentSearchTerm}
                onChange={onSearch}
              />
            </div>
            <select
              className="input-field"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="investment">Investment</option>
            </select>
            <input
              className="input-field"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              placeholder="Start Date"
            />
            <input
              className="input-field"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              placeholder="End Date"
            />
          </div>
        </div>
      )}

      {/* Feedback Messages */}
      {error && <div className="p-4 rounded-full bg-error/10 border border-error/20 text-error text-sm">{error}</div>}
      {success && (
        <div className="p-4 rounded-full bg-success/10 border border-success/20 text-success text-sm flex items-center gap-2 animate-in slide-in-from-top-2 fade-in">
          <TrendingUp size={16} /> {success}
        </div>
      )}

      {/* Table Section */}
      <TransactionTable
        transactions={transactions}
        loading={loading}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelection}
        onToggleAll={toggleAll}
        onEdit={handleEdit}
        onDelete={handleManualDelete}
      />

      {/* Pagination */}
      <div className="p-4 border-t border-border flex items-center justify-between bg-surface rounded-b-2xl">
        <p className="text-sm text-text-secondary">
          Showing {transactions.length} of {pagination.total} transactions
        </p>
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-lg border border-border hover:bg-surface-elevated disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => handleFilterChange('page', Math.max(1, pagination.page - 1))}
            disabled={pagination.page <= 1}
          >
            &lt;
          </button>
          <span className="text-sm font-medium text-text-primary">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            className="p-2 rounded-lg border border-border hover:bg-surface-elevated disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => handleFilterChange('page', Math.min(pagination.pages, pagination.page + 1))}
            disabled={pagination.page >= pagination.pages}
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
