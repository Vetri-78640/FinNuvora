'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { portfolioAPI, holdingAPI } from '@/lib/api';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';

const emptyPortfolioForm = {
  name: '',
  description: '',
};

const createEmptyHoldingForm = () => ({
  symbol: '',
  quantity: '',
  buyPrice: '',
  currentPrice: '',
});

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

export default function PortfoliosPage() {
  useProtectedRoute();

  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyPortfolioForm);
  const [creating, setCreating] = useState(false);
  const [savingPortfolioId, setSavingPortfolioId] = useState(null);
  const [holdingForms, setHoldingForms] = useState({});
  const [expandedPortfolioIds, setExpandedPortfolioIds] = useState(new Set());

  const loadPortfolios = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await portfolioAPI.getPortfolios();
      setPortfolios(data.portfolios || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load portfolios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPortfolios();
  }, [loadPortfolios]);

  const resetForm = () => {
    setForm(emptyPortfolioForm);
  };

  const handleCreatePortfolio = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError('Portfolio name is required');
      return;
    }

    try {
      setCreating(true);
      setError('');
      const { data } = await portfolioAPI.createPortfolio({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      });
      setPortfolios((prev) => [data.portfolio, ...prev]);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create portfolio');
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePortfolio = async (portfolioId) => {
    const confirmed = window.confirm('Delete this portfolio and all holdings?');
    if (!confirmed) return;

    try {
      setSavingPortfolioId(portfolioId);
      await portfolioAPI.deletePortfolio(portfolioId);
      setPortfolios((prev) => prev.filter((p) => p._id !== portfolioId));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete portfolio');
    } finally {
      setSavingPortfolioId(null);
    }
  };

  const toggleExpanded = (portfolioId) => {
    setExpandedPortfolioIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(portfolioId)) {
        updated.delete(portfolioId);
      } else {
        updated.add(portfolioId);
      }
      return updated;
    });
  };

  const ensureHoldingForm = useCallback(
    (portfolioId) => {
      setHoldingForms((prev) =>
        prev[portfolioId]
          ? prev
          : {
              ...prev,
              [portfolioId]: createEmptyHoldingForm(),
            }
      );
    },
    [setHoldingForms]
  );

  useEffect(() => {
    portfolios.forEach((portfolio) => ensureHoldingForm(portfolio._id));
  }, [portfolios, ensureHoldingForm]);

  const handleHoldingFormChange = (portfolioId, field, value) => {
    setHoldingForms((prev) => ({
      ...prev,
      [portfolioId]: {
        ...prev[portfolioId],
        [field]: value,
      },
    }));
  };

  const handleAddHolding = async (portfolioId) => {
    const formData = holdingForms[portfolioId] || createEmptyHoldingForm();
    const { symbol, quantity, buyPrice, currentPrice } = formData;

    if (!symbol || !quantity || !buyPrice || !currentPrice) {
      setError('All holding fields are required');
      return;
    }

    try {
      setSavingPortfolioId(portfolioId);
      setError('');
      const { data } = await holdingAPI.createHolding({
        portfolioId,
        symbol,
        quantity: Number(quantity),
        buyPrice: Number(buyPrice),
        currentPrice: Number(currentPrice),
      });

      setPortfolios((prev) =>
        prev.map((portfolio) =>
          portfolio._id === portfolioId
            ? {
                ...portfolio,
                holdings: [data.holding, ...(portfolio.holdings || [])],
              }
            : portfolio
        )
      );

      setHoldingForms((prev) => ({
        ...prev,
        [portfolioId]: createEmptyHoldingForm(),
      }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add holding');
    } finally {
      setSavingPortfolioId(null);
    }
  };

  const handleDeleteHolding = async (portfolioId, holdingId) => {
    const confirmed = window.confirm('Remove this holding?');
    if (!confirmed) return;

    try {
      setSavingPortfolioId(portfolioId);
      await holdingAPI.deleteHolding(holdingId);

      setPortfolios((prev) =>
        prev.map((portfolio) =>
          portfolio._id === portfolioId
            ? {
                ...portfolio,
                holdings: (portfolio.holdings || []).filter(
                  (holding) => holding._id !== holdingId
                ),
              }
            : portfolio
        )
      );
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove holding');
    } finally {
      setSavingPortfolioId(null);
    }
  };

  const portfolioStats = useMemo(() => {
    if (!portfolios.length) {
      return {
        totalPortfolios: 0,
        totalHoldings: 0,
      };
    }

    const totalHoldings = portfolios.reduce(
      (count, portfolio) => count + (portfolio.holdings?.length || 0),
      0
    );

    return {
      totalPortfolios: portfolios.length,
      totalHoldings,
    };
  }, [portfolios]);

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Portfolios
          </h2>
          <p className="text-slate-400 mt-2">
            Create and track your investment portfolios and holdings.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="card px-5 py-4 text-center">
            <p className="text-slate-400 text-sm">Total Portfolios</p>
            <p className="text-2xl font-bold text-white">
              {portfolioStats.totalPortfolios}
            </p>
          </div>
          <div className="card px-5 py-4 text-center">
            <p className="text-slate-400 text-sm">Total Holdings</p>
            <p className="text-2xl font-bold text-white">
              {portfolioStats.totalHoldings}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold text-white mb-4">
          Create new portfolio
        </h3>
        <form
          onSubmit={handleCreatePortfolio}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <input
            className="input-field"
            placeholder="Portfolio name"
            value={form.name}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, name: event.target.value }))
            }
            required
          />
          <input
            className="input-field md:col-span-2"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
          />
          <button
            type="submit"
            className="btn-primary md:col-span-3"
            disabled={creating}
          >
            {creating ? 'Creating...' : 'Create Portfolio'}
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
          <p className="text-slate-400 text-lg">Loading portfolios...</p>
        </div>
      ) : portfolios.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-white font-semibold text-lg mb-2">
            No portfolios yet
          </p>
          <p className="text-slate-400">
            Start by creating your first investment portfolio.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {portfolios.map((portfolio) => {
            const holdings = portfolio.holdings || [];
            const isExpanded = expandedPortfolioIds.has(portfolio._id);

            return (
              <div
                key={portfolio._id}
                className="card border border-slate-800/60 hover:border-blue-500/30 transition-all"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold text-white">
                      {portfolio.name}
                    </h3>
                    {portfolio.description && (
                      <p className="text-slate-400 mt-1">
                        {portfolio.description}
                      </p>
                    )}
                    <p className="text-slate-500 text-sm mt-2">
                      Created{' '}
                      {new Date(portfolio.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleExpanded(portfolio._id)}
                      className="btn-secondary px-4 py-2"
                    >
                      {isExpanded
                        ? 'Hide Holdings'
                        : `Show Holdings (${holdings.length})`}
                    </button>
                    <button
                      onClick={() => handleDeletePortfolio(portfolio._id)}
                      className="btn-ghost px-4 py-2 text-red-300 border-red-400/40 hover:border-red-400 hover:text-red-200"
                      disabled={savingPortfolioId === portfolio._id}
                    >
                      {savingPortfolioId === portfolio._id
                        ? 'Removing...'
                        : 'Delete'}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-6 space-y-6">
                    <div className="glass p-5 border border-slate-800/60">
                      <h4 className="text-lg font-semibold text-white mb-4">
                        Add holding
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <input
                          className="input-field"
                          placeholder="Symbol"
                          value={
                            holdingForms[portfolio._id]?.symbol || ''
                          }
                          onChange={(event) =>
                            handleHoldingFormChange(
                              portfolio._id,
                              'symbol',
                              event.target.value.toUpperCase()
                            )
                          }
                        />
                        <input
                          className="input-field"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Quantity"
                          value={
                            holdingForms[portfolio._id]?.quantity || ''
                          }
                          onChange={(event) =>
                            handleHoldingFormChange(
                              portfolio._id,
                              'quantity',
                              event.target.value
                            )
                          }
                        />
                        <input
                          className="input-field"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Buy price"
                          value={
                            holdingForms[portfolio._id]?.buyPrice || ''
                          }
                          onChange={(event) =>
                            handleHoldingFormChange(
                              portfolio._id,
                              'buyPrice',
                              event.target.value
                            )
                          }
                        />
                        <input
                          className="input-field"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Current price"
                          value={
                            holdingForms[portfolio._id]?.currentPrice || ''
                          }
                          onChange={(event) =>
                            handleHoldingFormChange(
                              portfolio._id,
                              'currentPrice',
                              event.target.value
                            )
                          }
                        />
                        <button
                          onClick={() => handleAddHolding(portfolio._id)}
                          className="btn-primary"
                          disabled={savingPortfolioId === portfolio._id}
                          type="button"
                        >
                          {savingPortfolioId === portfolio._id
                            ? 'Saving...'
                            : 'Add Holding'}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {holdings.length === 0 ? (
                        <div className="glass p-5 text-slate-400 text-sm text-center border border-slate-800/60">
                          No holdings recorded yet.
                        </div>
                      ) : (
                        holdings.map((holding) => (
                          <div
                            key={holding._id}
                            className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 glass border border-slate-800/60 px-4 py-4"
                          >
                            <div>
                              <p className="text-lg font-semibold text-white">
                                {holding.symbol}
                              </p>
                              <p className="text-slate-400 text-sm">
                                Quantity: {holding.quantity} · Bought at{' '}
                                {formatCurrency(holding.buyPrice)} · Current{' '}
                                {formatCurrency(holding.currentPrice)}
                              </p>
                              <p className="text-slate-500 text-xs mt-1">
                                Purchased{' '}
                                {new Date(
                                  holding.purchaseDate
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                handleDeleteHolding(portfolio._id, holding._id)
                              }
                              className="btn-ghost px-4 py-2 text-red-300 border-red-400/40 hover:border-red-400 hover:text-red-200"
                              disabled={savingPortfolioId === portfolio._id}
                            >
                              Remove
                            </button>
                          </div>
                        ))
                      )}
                    </div>
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
