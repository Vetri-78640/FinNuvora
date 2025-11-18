'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  transactionAPI,
  categoryAPI,
} from '@/lib/api';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';

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

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

const typeLabels = {
  income: 'Income',
  expense: 'Expense',
  investment: 'Investment',
};

export default function TransactionsPage() {
  useProtectedRoute();

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
  const [form, setForm] = useState(defaultForm);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState(defaultForm);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [uploading, setUploading] = useState(false);

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
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Failed to load transactions. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

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

  const handleCreateTransaction = async (event) => {
    event.preventDefault();

    if (!form.categoryId) {
      setError('Please choose a category before saving the transaction.');
      return;
    }

    try {
      setCreating(true);
      setError('');
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

      await transactionAPI.updateTransaction(editingId, {
        ...editingForm,
        amount: Number(editingForm.amount),
      });

      cancelEditing();
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
    const confirmed = window.confirm('Delete this transaction?');
    if (!confirmed) return;

    try {
      await transactionAPI.deleteTransaction(transactionId);
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

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await transactionAPI.uploadPDF(formData);
      if (response.success) {
        await loadTransactions();
        event.target.value = ''; // Reset file input
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Failed to upload PDF. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const summary = useMemo(() => {
    if (!transactions.length) {
      return {
        income: 0,
        expense: 0,
        investment: 0,
        net: 0,
      };
    }

    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') {
          acc.income += transaction.amount;
        } else if (transaction.type === 'expense') {
          acc.expense += transaction.amount;
        } else if (transaction.type === 'investment') {
          acc.investment += transaction.amount;
        }

        acc.net = acc.income - acc.expense;
        return acc;
      },
      {
        income: 0,
        expense: 0,
        investment: 0,
        net: 0,
      }
    );
  }, [transactions]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Transactions
          </h2>
          <p className="text-slate-400 mt-2">
            Search, filter, and manage all your financial activity.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="card px-4 py-3">
            <p className="text-slate-400 text-xs uppercase tracking-wide">
              Income
            </p>
            <p className="text-lg font-semibold text-emerald-300">
              {formatCurrency(summary.income)}
            </p>
          </div>
          <div className="card px-4 py-3">
            <p className="text-slate-400 text-xs uppercase tracking-wide">
              Expenses
            </p>
            <p className="text-lg font-semibold text-red-300">
              {formatCurrency(summary.expense)}
            </p>
          </div>
          <div className="card px-4 py-3">
            <p className="text-slate-400 text-xs uppercase tracking-wide">
              Investments
            </p>
            <p className="text-lg font-semibold text-blue-300">
              {formatCurrency(summary.investment)}
            </p>
          </div>
          <div className="card px-4 py-3">
            <p className="text-slate-400 text-xs uppercase tracking-wide">
              Net
            </p>
            <p
              className={`text-lg font-semibold ${
                summary.net >= 0 ? 'text-emerald-300' : 'text-red-300'
              }`}
            >
              {formatCurrency(summary.net)}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold text-white mb-4">Import from Bank Statement</h3>
        <p className="text-slate-400 text-sm mb-4">Upload a PDF bank statement to automatically extract and import transactions.</p>
        <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-slate-500 hover:bg-slate-800/30 transition-colors">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-slate-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-8-12v12m0 0l-4-4m4 4l4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-white font-medium">Click to upload or drag and drop</p>
            <p className="text-slate-400 text-xs mt-1">PDF files only (Max 50MB)</p>
          </div>
          <input
            type="file"
            accept=".pdf"
            onChange={handlePDFUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
        {uploading && <p className="text-slate-400 text-sm mt-3">Uploading and processing PDF...</p>}
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold text-white mb-4">
          {editingId ? 'Edit transaction' : 'Add new transaction'}
        </h3>
        <form
          onSubmit={
            editingId ? handleUpdateTransaction : handleCreateTransaction
          }
          className="grid grid-cols-1 md:grid-cols-6 gap-4"
        >
          <select
            className="input-field"
            value={editingId ? editingForm.categoryId : form.categoryId}
            onChange={(event) =>
              editingId
                ? setEditingForm((prev) => ({
                    ...prev,
                    categoryId: event.target.value,
                  }))
                : setForm((prev) => ({
                    ...prev,
                    categoryId: event.target.value,
                  }))
            }
            required
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            className="input-field"
            value={editingId ? editingForm.type : form.type}
            onChange={(event) =>
              editingId
                ? setEditingForm((prev) => ({
                    ...prev,
                    type: event.target.value,
                  }))
                : setForm((prev) => ({
                    ...prev,
                    type: event.target.value,
                  }))
            }
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="investment">Investment</option>
          </select>
          <input
            className="input-field"
            type="number"
            min="0"
            step="0.01"
            placeholder="Amount"
            value={editingId ? editingForm.amount : form.amount}
            onChange={(event) =>
              editingId
                ? setEditingForm((prev) => ({
                    ...prev,
                    amount: event.target.value,
                  }))
                : setForm((prev) => ({
                    ...prev,
                    amount: event.target.value,
                  }))
            }
            required
          />
          <input
            className="input-field md:col-span-2"
            placeholder="Description"
            value={editingId ? editingForm.description : form.description}
            onChange={(event) =>
              editingId
                ? setEditingForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                : setForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
            }
          />
          <input
            className="input-field"
            type="date"
            value={editingId ? editingForm.date : form.date}
            onChange={(event) =>
              editingId
                ? setEditingForm((prev) => ({
                    ...prev,
                    date: event.target.value,
                  }))
                : setForm((prev) => ({
                    ...prev,
                    date: event.target.value,
                  }))
            }
            required
          />
          <div className="flex items-center gap-3 md:col-span-6">
            <button
              type="submit"
              className="btn-primary"
              disabled={creating || submittingEdit}
            >
              {editingId
                ? submittingEdit
                  ? 'Saving changes...'
                  : 'Save changes'
                : creating
                ? 'Adding...'
                : 'Add transaction'}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn-ghost px-4 py-3"
                onClick={cancelEditing}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h3 className="text-xl font-semibold text-white">
            Filters &amp; search
          </h3>
          <button className="btn-ghost px-4 py-2" onClick={resetFilters}>
            Reset filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <input
            className="input-field md:col-span-2"
            placeholder="Search description..."
            value={filters.search}
            onChange={(event) => handleFilterChange('search', event.target.value)}
          />
          <select
            className="input-field"
            value={filters.type}
            onChange={(event) => handleFilterChange('type', event.target.value)}
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="investment">Investment</option>
          </select>
          <select
            className="input-field"
            value={filters.categoryId}
            onChange={(event) =>
              handleFilterChange('categoryId', event.target.value)
            }
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            className="input-field"
            type="date"
            value={filters.startDate}
            onChange={(event) =>
              handleFilterChange('startDate', event.target.value)
            }
          />
          <input
            className="input-field"
            type="date"
            value={filters.endDate}
            onChange={(event) =>
              handleFilterChange('endDate', event.target.value)
            }
          />
          <div className="grid grid-cols-2 md:col-span-2 gap-3">
            <select
              className="input-field"
              value={filters.sortBy}
              onChange={(event) =>
                handleFilterChange('sortBy', event.target.value)
              }
            >
              <option value="date">Sort by date</option>
              <option value="amount">Sort by amount</option>
              <option value="createdAt">Sort by created time</option>
            </select>
            <select
              className="input-field"
              value={filters.sortOrder}
              onChange={(event) =>
                handleFilterChange('sortOrder', event.target.value)
              }
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 px-4 py-3">
          {error}
        </div>
      )}

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="text-center py-12 text-slate-400">
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No transactions match the current filters.
          </div>
        ) : (
          <table className="min-w-full text-left">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-wide">
                <th className="py-3 pr-4">Date</th>
                <th className="py-3 pr-4">Category</th>
                <th className="py-3 pr-4">Type</th>
                <th className="py-3 pr-4 text-right">Amount</th>
                <th className="py-3 pr-4">Description</th>
                <th className="py-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.map((transaction) => (
                <tr key={transaction._id} className="text-sm text-slate-200">
                  <td className="py-3 pr-4">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-medium text-white">
                      {transaction.category?.name || '—'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        transaction.type === 'income'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                          : transaction.type === 'expense'
                          ? 'bg-red-500/10 text-red-300 border border-red-500/30'
                          : 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {typeLabels[transaction.type] || transaction.type}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right font-semibold">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="py-3 pr-4 text-slate-400">
                    {transaction.description || '—'}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        className="btn-ghost text-blue-300 border-blue-400/40 hover:border-blue-400 hover:text-blue-200 px-3 py-1"
                        onClick={() => startEditing(transaction)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-ghost text-red-300 border-red-400/40 hover:border-red-400 hover:text-red-200 px-3 py-1"
                        onClick={() => handleDeleteTransaction(transaction._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <p className="text-slate-400 text-sm">
          Page {pagination.page} of {pagination.pages} · {pagination.total}{' '}
          transactions
        </p>
        <div className="flex items-center gap-3">
          <button
            className="btn-ghost px-4 py-2"
            onClick={() =>
              handleFilterChange('page', Math.max(1, pagination.page - 1))
            }
            disabled={pagination.page <= 1}
          >
            Previous
          </button>
          <button
            className="btn-ghost px-4 py-2"
            onClick={() =>
              handleFilterChange(
                'page',
                Math.min(pagination.pages, pagination.page + 1)
              )
            }
            disabled={pagination.page >= pagination.pages}
          >
            Next
          </button>
          <select
            className="input-field w-28"
            value={filters.limit}
            onChange={(event) =>
              handleFilterChange('limit', Number(event.target.value))
            }
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
