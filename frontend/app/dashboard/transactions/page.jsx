'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  transactionAPI,
  categoryAPI,
} from '@/lib/api';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, Upload, Plus, Filter, Search, X, Loader2, Trash2 } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import Button from '@/components/ui/Button';
import { useCurrency } from '@/lib/contexts/CurrencyContext';

const defaultFilters = {
  search: '',
  type: '',
  categoryId: '',
  startDate: '',
  endDate: '',
  sortBy: 'date',
  sortOrder: 'desc',
  page: 1,
  limit: 10,
};

const defaultForm = {
  categoryId: '',
  type: 'expense',
  amount: '',
  description: '',
  date: new Date().toISOString().slice(0, 10),
};

const typeLabels = {
  income: 'Income',
  expense: 'Expense',
  investment: 'Investment',
};

export default function TransactionsPage() {
  useProtectedRoute();
  const { formatCurrency, convertToUSD } = useCurrency();

  const [filters, setFilters] = useState(defaultFilters);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(defaultForm);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState(defaultForm);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const loadCategories = useCallback(async () => {
    try {
      const { data } = await categoryAPI.getCategories();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const { data } = await transactionAPI.getTransactions(params);
      setTransactions(data.transactions || []);
      setPagination(
        data.pagination || {
          page: 1,
          pages: 1,
          total: data.transactions?.length || 0,
          limit: filters.limit,
        }
      );
      // Clear selection when filters change or page changes
      setSelectedIds(new Set());
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Failed to load transactions. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1,
    }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const toggleSelection = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedIds.size === transactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(transactions.map(t => t._id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    // Optional: confirm for bulk delete as it's a big action
    if (!window.confirm(`Delete ${selectedIds.size} transactions?`)) return;

    try {
      await transactionAPI.bulkDelete(Array.from(selectedIds));
      setSuccess(`${selectedIds.size} transactions deleted successfully`);
      setSelectedIds(new Set());
      await loadTransactions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Failed to delete transactions. Please try again.'
      );
    }
  };

  const handleCreateTransaction = async (event) => {
    event.preventDefault();

    if (!form.categoryId) {
      setError('Please choose a category before saving the transaction.');
      return;
    }

    try {
      setCreating(true);
      setError('');
      setSuccess('');
      await transactionAPI.createTransaction({
        ...form,
        amount: Number(form.amount),
      });

      setForm({
        ...defaultForm,
        date: form.date,
      });

      setFilters((prev) => ({
        ...prev,
        page: 1,
      }));

      setSuccess('Transaction added successfully');
      setTimeout(() => setSuccess(''), 3000);

      await loadTransactions();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Failed to create transaction. Please try again.'
      );
    } finally {
      setCreating(false);
    }
  };

  const startEditing = (transaction) => {
    setEditingId(transaction._id);
    setEditingForm({
      categoryId: transaction.category?._id || '',
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description || '',
      date: transaction.date?.slice(0, 10),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingForm(defaultForm);
  };

  const handleUpdateTransaction = async (event) => {
    event.preventDefault();

    if (!editingId) return;

    try {
      setSubmittingEdit(true);
      setError('');
      setSuccess('');

      await transactionAPI.updateTransaction(editingId, {
        ...editingForm,
        amount: Number(editingForm.amount),
      });

      cancelEditing();
      setSuccess('Transaction updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      await loadTransactions();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Failed to update transaction. Please try again.'
      );
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      await transactionAPI.deleteTransaction(transactionId);
      setSuccess('Transaction deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      await loadTransactions();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Failed to delete transaction. Please try again.'
      );
    }
  };

  const handlePDFUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      // Calculate conversion rate (User Currency -> USD)
      const conversionRate = convertToUSD(1);
      formData.append('conversionRate', conversionRate);

      const response = await transactionAPI.uploadPDF(formData);
      if (response.data.success) {
        await loadTransactions();
        setSuccess(response.data.message || 'Transactions imported successfully');
        event.target.value = ''; // Reset file input
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to upload PDF';
      setError(`Error: ${errorMessage} (Status: ${err.response?.status || 'Unknown'})`);
    } finally {
      setUploading(false);
    }
  };

  const summary = useMemo(() => {
    if (!transactions.length) {
      return { income: 0, expense: 0, investment: 0, net: 0 };
    }

    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') acc.income += transaction.amount;
        else if (transaction.type === 'expense') acc.expense += transaction.amount;
        else if (transaction.type === 'investment') acc.investment += transaction.amount;

        acc.net = acc.income - acc.expense;
        return acc;
      },
      { income: 0, expense: 0, investment: 0, net: 0 }
    );
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text-primary tracking-tight">
            Transactions
          </h2>
          <p className="text-text-secondary mt-1">
            Manage your financial activity
          </p>
        </div>
        <div className="flex gap-3">
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full hover:bg-red-500/20 transition-colors text-sm font-medium"
            >
              <Trash2 size={18} />
              Delete ({selectedIds.size})
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3 bg-[#1C1C1E] rounded-full text-white hover:bg-white/10 transition-colors text-sm font-medium"
          >
            <Filter size={18} />
            Filters
          </button>
          <label className={`flex items-center gap-2 px-6 py-3 bg-yellow-400 rounded-full text-black hover:bg-yellow-500 transition-colors text-sm font-bold cursor-pointer ${uploading ? 'opacity-70 cursor-wait' : ''}`}>
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            <span>{uploading ? 'Parsing...' : 'Import PDF'}</span>
            <input
              type="file"
              accept=".pdf"
              onChange={handlePDFUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={ArrowUpRight}
          title="Total Income"
          subtitle={formatCurrency(summary.income)}
          color="green"
        />
        <StatCard
          icon={ArrowDownRight}
          title="Total Expenses"
          subtitle={formatCurrency(summary.expense)}
          color="red"
        />
        <StatCard
          icon={TrendingUp}
          title="Investments"
          subtitle={formatCurrency(summary.investment)}
          color="blue"
        />
        <StatCard
          icon={Wallet}
          title="Net Balance"
          subtitle={formatCurrency(summary.net)}
          color={summary.net >= 0 ? 'primary' : 'red'}
        />
      </div>

      {/* Add/Edit Transaction Form */}
      <div className="card p-6">
        <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          {editingId ? <span className="text-primary">Edit Transaction</span> : <><Plus size={20} className="text-primary" /> Add New Transaction</>}
        </h3>
        <form
          onSubmit={editingId ? handleUpdateTransaction : handleCreateTransaction}
          className="grid grid-cols-1 md:grid-cols-12 gap-4"
        >
          <div className="md:col-span-2">
            <select
              className="input-field w-full"
              value={editingId ? editingForm.type : form.type}
              onChange={(e) => {
                const val = e.target.value;
                const setter = editingId ? setEditingForm : setForm;
                setter(prev => ({ ...prev, type: val }));
              }}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="investment">Investment</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              className="input-field w-full"
              value={editingId ? editingForm.categoryId : form.categoryId}
              onChange={(e) => {
                const val = e.target.value;
                const setter = editingId ? setEditingForm : setForm;
                setter(prev => ({ ...prev, categoryId: val }));
              }}
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <input
              className="input-field w-full"
              type="number"
              min="0"
              step="0.01"
              placeholder="Amount"
              value={editingId ? editingForm.amount : form.amount}
              onChange={(e) => {
                const val = e.target.value;
                const setter = editingId ? setEditingForm : setForm;
                setter(prev => ({ ...prev, amount: val }));
              }}
              required
            />
          </div>

          <div className="md:col-span-3">
            <input
              className="input-field w-full"
              placeholder="Description"
              value={editingId ? editingForm.description : form.description}
              onChange={(e) => {
                const val = e.target.value;
                const setter = editingId ? setEditingForm : setForm;
                setter(prev => ({ ...prev, description: val }));
              }}
            />
          </div>

          <div className="md:col-span-2">
            <input
              className="input-field w-full"
              type="date"
              value={editingId ? editingForm.date : form.date}
              onChange={(e) => {
                const val = e.target.value;
                const setter = editingId ? setEditingForm : setForm;
                setter(prev => ({ ...prev, date: val }));
              }}
              required
            />
          </div>

          <div className="md:col-span-12 flex justify-end gap-3 mt-2">
            {editingId && (
              <Button variant="ghost" onClick={cancelEditing} type="button">
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              isLoading={creating || submittingEdit}
              disabled={creating || submittingEdit}
            >
              {editingId ? 'Save Changes' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </div>

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
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
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

      {error && (
        <div className="p-4 rounded-full bg-error/10 border border-error/20 text-error text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-full bg-success/10 border border-success/20 text-success text-sm flex items-center gap-2 animate-in slide-in-from-top-2 fade-in">
          <TrendingUp size={16} /> {success}
        </div>
      )}

      {/* Transactions Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-elevated/50">
                <th className="py-4 px-6 w-10">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800/50 text-yellow-500 focus:ring-yellow-500/50 focus:ring-offset-0 cursor-pointer accent-yellow-500"
                    checked={transactions.length > 0 && selectedIds.size === transactions.length}
                    onChange={toggleAll}
                  />
                </th>
                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary">Date</th>
                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary">Category</th>
                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary">Type</th>
                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary">Description</th>
                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary text-right">Amount</th>
                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-text-secondary">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-4 w-32 bg-surface-elevated rounded mb-2"></div>
                      <div className="h-3 w-24 bg-surface-elevated rounded"></div>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-text-secondary">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction._id} className={`group hover:bg-surface-elevated/50 transition-colors ${selectedIds.has(transaction._id) ? 'bg-yellow-500/5' : ''}`}>
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800/50 text-yellow-500 focus:ring-yellow-500/50 focus:ring-offset-0 cursor-pointer accent-yellow-500"
                        checked={selectedIds.has(transaction._id)}
                        onChange={() => toggleSelection(transaction._id)}
                      />
                    </td>
                    <td className="py-4 px-6 text-sm text-text-primary">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-sm text-text-primary">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-elevated text-text-secondary border border-border">
                        {transaction.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${transaction.type === 'income' ? 'bg-success/10 text-success border-success/20' :
                        transaction.type === 'expense' ? 'bg-error/10 text-error border-error/20' :
                          'bg-info/10 text-info border-info/20'
                        }`}>
                        {typeLabels[transaction.type] || transaction.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-text-secondary max-w-xs truncate">
                      {transaction.description || '—'}
                    </td>
                    <td className={`py-4 px-6 text-sm font-bold text-right ${transaction.type === 'income' ? 'text-success' :
                      transaction.type === 'expense' ? 'text-error' : 'text-info'
                      }`}>
                      {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditing(transaction)}
                          className="p-2 rounded-lg hover:bg-surface text-text-secondary hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction._id)}
                          className="p-2 rounded-lg hover:bg-surface text-text-secondary hover:text-error transition-colors"
                          title="Delete"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Showing {transactions.length} of {pagination.total} transactions
          </p>
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-lg border border-border hover:bg-surface-elevated disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={() => handleFilterChange('page', Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <span className="text-sm font-medium text-text-primary">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              className="p-2 rounded-lg border border-border hover:bg-surface-elevated disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={() => handleFilterChange('page', Math.min(pagination.pages, pagination.page + 1))}
              disabled={pagination.page >= pagination.pages}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
