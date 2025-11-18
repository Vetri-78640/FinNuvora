'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { goalAPI } from '@/lib/api';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';

const defaultGoalForm = {
  title: '',
  description: '',
  targetAmount: '',
  deadline: '',
  category: '',
};

const defaultProgressForm = {
  amount: '',
};

const statusOptions = [
  { value: '', label: 'All goals' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'abandoned', label: 'Abandoned' },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

export default function GoalsPage() {
  useProtectedRoute();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: 'active' });
  const [form, setForm] = useState(defaultGoalForm);
  const [creating, setCreating] = useState(false);
  const [progressForms, setProgressForms] = useState({});
  const [updatingGoalId, setUpdatingGoalId] = useState(null);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editForm, setEditForm] = useState(defaultGoalForm);

  const loadGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await goalAPI.getGoals(
        filters.status ? { status: filters.status } : undefined
      );
      setGoals(data.goals || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleCreateGoal = async (event) => {
    event.preventDefault();

    if (!form.title || !form.targetAmount || !form.deadline) {
      setError('Title, target amount, and deadline are required');
      return;
    }

    try {
      setCreating(true);
      setError('');
      await goalAPI.createGoal({
        ...form,
        targetAmount: Number(form.targetAmount),
      });

      setForm(defaultGoalForm);
      await loadGoals();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create goal');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    const confirmed = window.confirm(
      'Delete this goal? This cannot be undone.'
    );
    if (!confirmed) return;

    try {
      setUpdatingGoalId(goalId);
      await goalAPI.deleteGoal(goalId);
      await loadGoals();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete goal');
    } finally {
      setUpdatingGoalId(null);
    }
  };

  const handleProgressChange = (goalId, value) => {
    setProgressForms((prev) => ({
      ...prev,
      [goalId]: {
        amount: value,
      },
    }));
  };

  const handleUpdateProgress = async (goalId) => {
    const amount = Number(progressForms[goalId]?.amount || 0);
    if (!amount || amount <= 0) {
      setError('Enter a positive amount to update progress');
      return;
    }

    try {
      setUpdatingGoalId(goalId);
      setError('');
      await goalAPI.updateGoalProgress(goalId, amount);
      setProgressForms((prev) => ({
        ...prev,
        [goalId]: defaultProgressForm,
      }));
      await loadGoals();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update progress');
    } finally {
      setUpdatingGoalId(null);
    }
  };

  const startEditingGoal = (goal) => {
    setEditingGoalId(goal._id);
    setEditForm({
      title: goal.title,
      description: goal.description || '',
      targetAmount: goal.targetAmount,
      deadline: goal.deadline?.slice(0, 10),
      category: goal.category || '',
      status: goal.status,
    });
  };

  const cancelEditing = () => {
    setEditingGoalId(null);
    setEditForm(defaultGoalForm);
  };

  const handleUpdateGoal = async (event) => {
    event.preventDefault();

    if (!editingGoalId) return;

    try {
      setUpdatingGoalId(editingGoalId);
      await goalAPI.updateGoal(editingGoalId, {
        ...editForm,
        targetAmount: editForm.targetAmount
          ? Number(editForm.targetAmount)
          : undefined,
      });
      cancelEditing();
      await loadGoals();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update goal');
    } finally {
      setUpdatingGoalId(null);
    }
  };

  const summary = useMemo(() => {
    if (!goals.length) {
      return {
        total: 0,
        active: 0,
        completed: 0,
        totalSaved: 0,
        totalTarget: 0,
      };
    }

    return goals.reduce(
      (acc, goal) => {
        acc.total += 1;
        acc.totalSaved += goal.currentAmount;
        acc.totalTarget += goal.targetAmount;
        if (goal.status === 'completed') {
          acc.completed += 1;
        } else if (goal.status === 'active') {
          acc.active += 1;
        }
        return acc;
      },
      {
        total: 0,
        active: 0,
        completed: 0,
        totalSaved: 0,
        totalTarget: 0,
      }
    );
  }, [goals]);

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Financial Goals
          </h2>
          <p className="text-slate-400 mt-2">
            Track your progress and stay on top of every milestone.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card px-4 py-3 text-center">
            <p className="text-slate-400 text-xs uppercase">Active goals</p>
            <p className="text-xl font-semibold text-white">{summary.active}</p>
          </div>
          <div className="card px-4 py-3 text-center">
            <p className="text-slate-400 text-xs uppercase">Completed</p>
            <p className="text-xl font-semibold text-emerald-300">
              {summary.completed}
            </p>
          </div>
          <div className="card px-4 py-3 text-center">
            <p className="text-slate-400 text-xs uppercase">Saved so far</p>
            <p className="text-xl font-semibold text-blue-300">
              {formatCurrency(summary.totalSaved)}
            </p>
          </div>
          <div className="card px-4 py-3 text-center">
            <p className="text-slate-400 text-xs uppercase">Total target</p>
            <p className="text-xl font-semibold text-slate-200">
              {formatCurrency(summary.totalTarget)}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h3 className="text-xl font-semibold text-white">Create a goal</h3>
          <select
            className="input-field md:w-48"
            value={filters.status}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                status: event.target.value,
              }))
            }
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <form
          onSubmit={handleCreateGoal}
          className="grid grid-cols-1 md:grid-cols-6 gap-4"
        >
          <input
            className="input-field md:col-span-2"
            placeholder="Goal title"
            value={form.title}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, title: event.target.value }))
            }
            required
          />
          <input
            className="input-field md:col-span-2"
            placeholder="Category (optional)"
            value={form.category}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, category: event.target.value }))
            }
          />
          <input
            className="input-field"
            type="number"
            min="0"
            step="0.01"
            placeholder="Target amount"
            value={form.targetAmount}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, targetAmount: event.target.value }))
            }
            required
          />
          <input
            className="input-field"
            type="date"
            value={form.deadline}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, deadline: event.target.value }))
            }
            required
          />
          <textarea
            className="input-field md:col-span-4"
            rows={2}
            placeholder="Description (optional)"
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
          />
          <button
            type="submit"
            className="btn-primary md:col-span-2"
            disabled={creating}
          >
            {creating ? 'Saving...' : 'Create goal'}
          </button>
        </form>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 px-4 py-3">
          {error}
        </div>
      )}

      {loading ? (
        <div className="card text-center py-12">
          <p className="text-slate-400 text-lg">Loading goals...</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-white font-semibold text-lg mb-2">
            No goals to display
          </p>
          <p className="text-slate-400">
            Create a goal above to start tracking your progress.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {goals.map((goal) => {
            const progress = Math.min(Math.max(goal.progress || 0, 0), 100);
            const daysRemaining =
              goal.daysRemaining >= 0
                ? `${goal.daysRemaining} days left`
                : 'Past deadline';

            const progressForm = progressForms[goal._id] || defaultProgressForm;

            return (
              <div
                key={goal._id}
                className="card border border-slate-800/60 hover:border-blue-500/30 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-semibold text-white">
                        {goal.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                          goal.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/40'
                            : goal.status === 'active'
                            ? 'bg-blue-500/10 text-blue-300 border border-blue-500/40'
                            : 'bg-slate-500/10 text-slate-300 border border-slate-500/40'
                        }`}
                      >
                        {goal.status}
                      </span>
                    </div>
                    <p className="text-slate-400 mt-2">
                      Target {formatCurrency(goal.targetAmount)} · Saved{' '}
                      <span className="text-white font-medium">
                        {formatCurrency(goal.currentAmount)}
                      </span>
                    </p>
                    <p className="text-slate-500 text-sm mt-1">
                      Deadline{' '}
                      {new Date(goal.deadline).toLocaleDateString()} ·{' '}
                      {daysRemaining}
                    </p>
                    {goal.description && (
                      <p className="text-slate-400 mt-3">{goal.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditingGoal(goal)}
                      className="btn-ghost px-4 py-2 text-blue-300 border-blue-400/40 hover:border-blue-400 hover:text-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal._id)}
                      className="btn-ghost px-4 py-2 text-red-300 border-red-400/40 hover:border-red-400 hover:text-red-200"
                      disabled={updatingGoalId === goal._id}
                    >
                      {updatingGoalId === goal._id ? 'Removing...' : 'Delete'}
                    </button>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="w-full bg-slate-800/60 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <p className="text-slate-400 text-sm">
                      {progress}% complete · Remaining{' '}
                      {formatCurrency(
                        Math.max(goal.targetAmount - goal.currentAmount, 0)
                      )}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="input-field w-36"
                          placeholder="Add amount"
                          value={progressForm.amount}
                          onChange={(event) =>
                            handleProgressChange(goal._id, event.target.value)
                          }
                        />
                        <button
                          className="btn-primary px-4 py-3"
                          onClick={() => handleUpdateProgress(goal._id)}
                          disabled={updatingGoalId === goal._id}
                        >
                          {updatingGoalId === goal._id
                            ? 'Updating...'
                            : 'Update progress'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {editingGoalId === goal._id && (
                  <div className="mt-6 border border-slate-800/60 rounded-xl p-5 bg-slate-900/40">
                    <h4 className="text-lg font-semibold text-white mb-4">
                      Edit goal
                    </h4>
                    <form
                      onSubmit={handleUpdateGoal}
                      className="grid grid-cols-1 md:grid-cols-6 gap-4"
                    >
                      <input
                        className="input-field md:col-span-2"
                        placeholder="Title"
                        value={editForm.title}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            title: event.target.value,
                          }))
                        }
                        required
                      />
                      <input
                        className="input-field"
                        placeholder="Category"
                        value={editForm.category}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            category: event.target.value,
                          }))
                        }
                      />
                      <input
                        className="input-field"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Target"
                        value={editForm.targetAmount}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            targetAmount: event.target.value,
                          }))
                        }
                      />
                      <input
                        className="input-field"
                        type="date"
                        value={editForm.deadline}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            deadline: event.target.value,
                          }))
                        }
                      />
                      <select
                        className="input-field"
                        value={editForm.status}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            status: event.target.value,
                          }))
                        }
                      >
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="abandoned">Abandoned</option>
                      </select>
                      <textarea
                        className="input-field md:col-span-6"
                        rows={3}
                        placeholder="Description"
                        value={editForm.description}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            description: event.target.value,
                          }))
                        }
                      />
                      <div className="flex items-center gap-3 md:col-span-6">
                        <button
                          type="submit"
                          className="btn-primary"
                          disabled={updatingGoalId === goal._id}
                        >
                          {updatingGoalId === goal._id
                            ? 'Saving...'
                            : 'Save goal'}
                        </button>
                        <button
                          type="button"
                          className="btn-ghost px-4 py-3"
                          onClick={cancelEditing}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
