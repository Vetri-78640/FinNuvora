'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { goalAPI } from '@/lib/api';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { useCurrency } from '@/lib/contexts/CurrencyContext';
import { Target, CheckCircle, TrendingUp, Flag, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import Button from '@/components/ui/Button';

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
  { value: '', label: 'All Goals' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'abandoned', label: 'Abandoned' },
];

export default function GoalsPage() {
  useProtectedRoute();
  const { formatCurrency, convertToUSD, convertAmount } = useCurrency();

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
        targetAmount: convertToUSD(Number(form.targetAmount)),
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
      await goalAPI.updateGoalProgress(goalId, convertToUSD(amount));
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
      targetAmount: convertAmount(goal.targetAmount).toFixed(2),
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
          ? convertToUSD(Number(editForm.targetAmount))
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
      return { total: 0, active: 0, completed: 0, totalSaved: 0, totalTarget: 0 };
    }

    return goals.reduce(
      (acc, goal) => {
        acc.total += 1;
        acc.totalSaved += goal.currentAmount;
        acc.totalTarget += goal.targetAmount;
        if (goal.status === 'completed') acc.completed += 1;
        else if (goal.status === 'active') acc.active += 1;
        return acc;
      },
      { total: 0, active: 0, completed: 0, totalSaved: 0, totalTarget: 0 }
    );
  }, [goals]);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text-primary tracking-tight">
            Financial Goals
          </h2>
          <p className="text-text-secondary mt-1">
            Track your progress and achieve your dreams
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Target}
          title="Active Goals"
          subtitle={`${summary.active} Goals`}
          color="primary"
        />
        <StatCard
          icon={CheckCircle}
          title="Completed"
          subtitle={`${summary.completed} Goals`}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          title="Saved So Far"
          subtitle={formatCurrency(summary.totalSaved)}
          color="blue"
        />
        <StatCard
          icon={Flag}
          title="Total Target"
          subtitle={formatCurrency(summary.totalTarget)}
          color="purple"
        />
      </div>

      {/* Create Goal Form */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Plus size={20} className="text-primary" /> Create New Goal
          </h3>
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
          className="grid grid-cols-1 md:grid-cols-12 gap-4"
        >
          <div className="md:col-span-4">
            <input
              className="input-field w-full"
              placeholder="Goal Title"
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
              required
            />
          </div>
          <div className="md:col-span-3">
            <input
              className="input-field w-full"
              placeholder="Category (e.g. Travel, Home)"
              value={form.category}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, category: event.target.value }))
              }
            />
          </div>
          <div className="md:col-span-3">
            <input
              className="input-field w-full"
              type="number"
              min="0"
              step="0.01"
              placeholder="Target Amount"
              value={form.targetAmount}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, targetAmount: event.target.value }))
              }
              required
            />
          </div>
          <div className="md:col-span-2">
            <input
              className="input-field w-full"
              type="date"
              value={form.deadline}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, deadline: event.target.value }))
              }
              required
            />
          </div>
          <div className="md:col-span-10">
            <input
              className="input-field w-full"
              placeholder="Description (optional)"
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
            />
          </div>
          <div className="md:col-span-2">
            <Button
              type="submit"
              className="w-full"
              isLoading={creating}
              disabled={creating}
            >
              Create Goal
            </Button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-full bg-error/10 border border-error/20 text-error text-sm">
          {error}
        </div>
      )}

      {/* Goals List */}
      {loading ? (
        <div className="card text-center py-12">
          <p className="text-text-secondary animate-pulse">Loading goals...</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-4 text-text-secondary">
            <Target size={32} />
          </div>
          <p className="text-text-primary font-bold text-lg mb-2">
            No goals found
          </p>
          <p className="text-text-secondary">
            Create a goal above to start tracking your progress.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const progress = Math.min(Math.max(goal.progress || 0, 0), 100);
            const daysRemaining = goal.daysRemaining >= 0 ? `${goal.daysRemaining} days left` : 'Past deadline';
            const progressForm = progressForms[goal._id] || defaultProgressForm;
            const isEditing = editingGoalId === goal._id;

            return (
              <div
                key={goal._id}
                className={`card p-6 border transition-all ${isEditing ? 'border-primary shadow-lg shadow-primary/10' : 'border-border hover:border-primary/50'}`}
              >
                {isEditing ? (
                  <form onSubmit={handleUpdateGoal} className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-text-primary">Edit Goal</h4>
                      <button type="button" onClick={cancelEditing} className="text-text-secondary hover:text-text-primary"><X size={20} /></button>
                    </div>
                    <input
                      className="input-field w-full"
                      placeholder="Title"
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        className="input-field w-full"
                        type="number"
                        placeholder="Target"
                        value={editForm.targetAmount}
                        onChange={(e) => setEditForm(prev => ({ ...prev, targetAmount: e.target.value }))}
                      />
                      <input
                        className="input-field w-full"
                        type="date"
                        value={editForm.deadline}
                        onChange={(e) => setEditForm(prev => ({ ...prev, deadline: e.target.value }))}
                      />
                    </div>
                    <select
                      className="input-field w-full"
                      value={editForm.status}
                      onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="abandoned">Abandoned</option>
                    </select>
                    <div className="flex justify-end gap-3">
                      <Button variant="ghost" onClick={cancelEditing} type="button">Cancel</Button>
                      <Button type="submit" isLoading={updatingGoalId === goal._id}>Save Changes</Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold text-text-primary">{goal.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${goal.status === 'completed' ? 'bg-success/10 text-success border-success/20' :
                            goal.status === 'active' ? 'bg-primary/10 text-primary border-primary/20' :
                              'bg-surface-elevated text-text-secondary border-border'
                            }`}>
                            {goal.status}
                          </span>
                        </div>
                        <p className="text-text-secondary text-sm">{goal.category || 'General'}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => startEditingGoal(goal)} className="p-2 text-text-secondary hover:text-primary hover:bg-surface-elevated rounded-lg transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteGoal(goal._id)} className="p-2 text-text-secondary hover:text-error hover:bg-surface-elevated rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-text-secondary">Progress</span>
                        <span className="font-bold text-text-primary">{progress}%</span>
                      </div>
                      <div className="w-full h-3 bg-surface-elevated rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${progress >= 100 ? 'bg-success' : 'bg-primary'
                            }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs mt-2 text-text-secondary">
                        <span>{formatCurrency(goal.currentAmount)} saved</span>
                        <span>Target: {formatCurrency(goal.targetAmount)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="text-xs text-text-secondary flex items-center gap-1">
                        <Flag size={12} />
                        {daysRemaining}
                      </div>

                      {goal.status === 'active' && (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            className="input-field py-1 px-2 w-24 text-sm h-8"
                            placeholder="Add funds"
                            value={progressForm.amount}
                            onChange={(e) => handleProgressChange(goal._id, e.target.value)}
                          />
                          <button
                            onClick={() => handleUpdateProgress(goal._id)}
                            disabled={updatingGoalId === goal._id}
                            className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary text-background hover:bg-primary-dark transition-colors disabled:opacity-50"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
