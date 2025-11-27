'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { portfolioAPI, holdingAPI, stockAPI } from '@/lib/api';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import SmartAddInput from '@/components/SmartAddInput';
import PortfolioChart from '@/components/PortfolioChart';
import { RefreshCw, Briefcase, PieChart, DollarSign, Plus, Trash2, ChevronDown, ChevronUp, TrendingUp, TrendingDown } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import Button from '@/components/ui/Button';

import { useCurrency } from '@/lib/contexts/CurrencyContext';

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

export default function PortfoliosPage() {
  useProtectedRoute();
  const { formatCurrency } = useCurrency();

  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyPortfolioForm);
  const [creating, setCreating] = useState(false);
  const [savingPortfolioId, setSavingPortfolioId] = useState(null);
  const [holdingForms, setHoldingForms] = useState({});
  const [expandedPortfolioIds, setExpandedPortfolioIds] = useState(new Set());
  const [livePrices, setLivePrices] = useState({});
  const [refreshingPrices, setRefreshingPrices] = useState(false);

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

  // Fetch live prices for all holdings
  const fetchLivePrices = useCallback(async () => {
    if (portfolios.length === 0) return;

    const symbols = new Set();
    portfolios.forEach(p => {
      (p.holdings || []).forEach(h => {
        if (h.symbol) symbols.add(h.symbol);
      });
    });

    if (symbols.size === 0) return;

    try {
      setRefreshingPrices(true);
      const { data } = await stockAPI.getBatch(Array.from(symbols));

      const priceMap = {};
      data.data.forEach(item => {
        priceMap[item.symbol] = item.price;
      });

      setLivePrices(prev => ({ ...prev, ...priceMap }));
    } catch (err) {
      console.error('Failed to fetch live prices:', err);
    } finally {
      setRefreshingPrices(false);
    }
  }, [portfolios]);

  // Initial price fetch when portfolios load
  useEffect(() => {
    if (portfolios.length > 0) {
      fetchLivePrices();
    }
  }, [portfolios.length]); // Only run when portfolio count changes (initial load)

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
    const { symbol, quantity, buyPrice } = formData;

    // If current price is not provided, use buy price or live price if available
    const currentPrice = formData.currentPrice || livePrices[symbol] || buyPrice;

    if (!symbol || !quantity || !buyPrice) {
      setError('Symbol, quantity, and buy price are required');
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

      // Refresh prices to get the latest for the new holding
      fetchLivePrices();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add holding');
    } finally {
      setSavingPortfolioId(null);
    }
  };

  const handleSmartAdd = async (text, portfolioId) => {
    try {
      setError('');
      const { data } = await holdingAPI.smartAdd(text, portfolioId);

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

      // Refresh prices
      fetchLivePrices();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add holding via AI');
      throw err; // Re-throw for the component to handle state
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

  // Enrich portfolios with live prices for charts
  const enrichedPortfolios = useMemo(() => {
    return portfolios.map(p => ({
      ...p,
      holdings: (p.holdings || []).map(h => ({
        ...h,
        currentPrice: livePrices[h.symbol] || h.currentPrice || h.buyPrice
      }))
    }));
  }, [portfolios, livePrices]);

  const portfolioStats = useMemo(() => {
    if (!enrichedPortfolios.length) {
      return {
        totalPortfolios: 0,
        totalHoldings: 0,
        totalValue: 0,
      };
    }

    let totalHoldings = 0;
    let totalValue = 0;

    enrichedPortfolios.forEach(portfolio => {
      const holdings = portfolio.holdings || [];
      totalHoldings += holdings.length;
      holdings.forEach(h => {
        totalValue += h.quantity * (h.currentPrice || 0);
      });
    });

    return {
      totalPortfolios: enrichedPortfolios.length,
      totalHoldings,
      totalValue
    };
  }, [enrichedPortfolios]);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text-primary tracking-tight">
            Portfolios
          </h2>
          <p className="text-text-secondary mt-1">
            Track your investments with real-time updates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={fetchLivePrices}
            disabled={refreshingPrices}
            className="text-primary hover:text-primary-light"
          >
            <RefreshCw size={16} className={`mr-2 ${refreshingPrices ? "animate-spin" : ""}`} />
            {refreshingPrices ? 'Updating...' : 'Refresh Prices'}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={DollarSign}
          title="Total Value"
          subtitle={formatCurrency(portfolioStats.totalValue)}
          color="green"
        />
        <StatCard
          icon={Briefcase}
          title="Portfolios"
          subtitle={`${portfolioStats.totalPortfolios} Active`}
          color="blue"
        />
        <StatCard
          icon={PieChart}
          title="Total Holdings"
          subtitle={`${portfolioStats.totalHoldings} Assets`}
          color="purple"
        />
      </div>

      {/* Charts Section */}
      {portfolioStats.totalHoldings > 0 && (
        <PortfolioChart portfolios={enrichedPortfolios} />
      )}

      {/* Create Portfolio Form */}
      <div className="card p-6">
        <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
          <Plus size={20} className="text-primary" /> Create New Portfolio
        </h3>
        <form
          onSubmit={handleCreatePortfolio}
          className="grid grid-cols-1 md:grid-cols-12 gap-4"
        >
          <div className="md:col-span-4">
            <input
              className="input-field w-full"
              placeholder="Portfolio Name"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              required
            />
          </div>
          <div className="md:col-span-6">
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
              Create
            </Button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-full bg-error/10 border border-error/20 text-error text-sm">
          {error}
        </div>
      )}

      {/* Portfolios List */}
      {loading ? (
        <div className="card text-center py-12">
          <p className="text-text-secondary animate-pulse">Loading portfolios...</p>
        </div>
      ) : portfolios.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-4 text-text-secondary">
            <Briefcase size={32} />
          </div>
          <p className="text-text-primary font-bold text-lg mb-2">
            No portfolios yet
          </p>
          <p className="text-text-secondary">
            Start by creating your first investment portfolio.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {enrichedPortfolios.map((portfolio) => {
            const holdings = portfolio.holdings || [];
            const isExpanded = expandedPortfolioIds.has(portfolio._id);

            // Calculate portfolio specific value
            const portfolioValue = holdings.reduce((sum, h) => sum + (h.quantity * (h.currentPrice || 0)), 0);

            return (
              <div
                key={portfolio._id}
                className="card border border-border overflow-hidden"
              >
                <div className="p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-surface hover:bg-surface-elevated transition-colors">
                  <div className="flex-1 cursor-pointer" onClick={() => toggleExpanded(portfolio._id)}>
                    <div className="flex items-center gap-4 mb-1">
                      <h3 className="text-xl font-bold text-text-primary">
                        {portfolio.name}
                      </h3>
                      <span className="text-success font-mono font-bold bg-success/10 px-2 py-0.5 rounded text-sm border border-success/20">
                        {formatCurrency(portfolioValue)}
                      </span>
                    </div>
                    {portfolio.description && (
                      <p className="text-text-secondary text-sm">
                        {portfolio.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => toggleExpanded(portfolio._id)}
                      className="flex items-center gap-2"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      {isExpanded ? 'Hide' : `Holdings (${holdings.length})`}
                    </Button>
                    <button
                      onClick={() => handleDeletePortfolio(portfolio._id)}
                      className="p-2 text-text-secondary hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                      disabled={savingPortfolioId === portfolio._id}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border bg-surface-elevated/30 p-6">
                    {/* Smart Add Section */}
                    <div className="mb-8">
                      <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">
                        Add New Holding
                      </h4>

                      <div className="mb-6">
                        <SmartAddInput
                          onAdd={(text) => handleSmartAdd(text, portfolio._id)}
                          disabled={savingPortfolioId === portfolio._id}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                        <div className="md:col-span-3">
                          <label className="text-xs text-text-secondary mb-1 block">Symbol</label>
                          <input
                            className="input-field w-full"
                            placeholder="e.g. AAPL"
                            value={holdingForms[portfolio._id]?.symbol || ''}
                            onChange={(event) =>
                              handleHoldingFormChange(
                                portfolio._id,
                                'symbol',
                                event.target.value.toUpperCase()
                              )
                            }
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="text-xs text-text-secondary mb-1 block">Quantity</label>
                          <input
                            className="input-field w-full"
                            type="number"
                            min="0"
                            step="any"
                            placeholder="0.00"
                            value={holdingForms[portfolio._id]?.quantity || ''}
                            onChange={(event) =>
                              handleHoldingFormChange(
                                portfolio._id,
                                'quantity',
                                event.target.value
                              )
                            }
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="text-xs text-text-secondary mb-1 block">Buy Price</label>
                          <input
                            className="input-field w-full"
                            type="number"
                            min="0"
                            step="any"
                            placeholder="0.00"
                            value={holdingForms[portfolio._id]?.buyPrice || ''}
                            onChange={(event) =>
                              handleHoldingFormChange(
                                portfolio._id,
                                'buyPrice',
                                event.target.value
                              )
                            }
                          />
                        </div>
                        <div className="md:col-span-3">
                          <Button
                            onClick={() => handleAddHolding(portfolio._id)}
                            className="w-full"
                            disabled={savingPortfolioId === portfolio._id}
                            isLoading={savingPortfolioId === portfolio._id}
                          >
                            Add Manually
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">
                        Current Holdings
                      </h4>

                      {holdings.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-border rounded-full">
                          <p className="text-text-secondary text-sm">No holdings recorded yet.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {holdings.map((holding) => {
                            const currentValue = holding.quantity * (holding.currentPrice || 0);
                            const buyValue = holding.quantity * holding.buyPrice;
                            const gainLoss = currentValue - buyValue;
                            const gainLossPercent = (gainLoss / buyValue) * 100;
                            const isPositive = gainLoss >= 0;

                            return (
                              <div
                                key={holding._id}
                                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface border border-border rounded-full p-4 hover:border-primary/30 transition-colors"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center text-text-primary font-bold text-xs">
                                    {holding.symbol.substring(0, 2)}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="font-bold text-text-primary">
                                        {holding.symbol}
                                      </p>
                                      <span className="text-xs text-text-secondary bg-surface-elevated px-1.5 py-0.5 rounded">
                                        {holding.quantity} shares
                                      </span>
                                    </div>
                                    <p className="text-text-secondary text-xs mt-0.5">
                                      Avg. Buy: {formatCurrency(holding.buyPrice)}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-6 md:justify-end flex-1">
                                  <div className="text-right">
                                    <p className="text-text-secondary text-xs">Current Price</p>
                                    <p className="font-mono text-text-primary text-sm">
                                      {formatCurrency(holding.currentPrice)}
                                    </p>
                                  </div>

                                  <div className="text-right min-w-[100px]">
                                    <p className="text-text-secondary text-xs">Total Value</p>
                                    <p className="font-mono font-bold text-text-primary">
                                      {formatCurrency(currentValue)}
                                    </p>
                                  </div>

                                  <div className="text-right min-w-[100px]">
                                    <p className="text-text-secondary text-xs">Gain/Loss</p>
                                    <div className={`flex items-center justify-end gap-1 font-mono font-bold ${isPositive ? "text-success" : "text-error"}`}>
                                      {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                      <span>
                                        {isPositive ? '+' : ''}{formatCurrency(gainLoss)}
                                      </span>
                                    </div>
                                    <p className={`text-xs ${isPositive ? "text-success" : "text-error"}`}>
                                      ({gainLossPercent.toFixed(2)}%)
                                    </p>
                                  </div>

                                  <button
                                    onClick={() =>
                                      handleDeleteHolding(portfolio._id, holding._id)
                                    }
                                    className="p-2 text-text-secondary hover:text-error hover:bg-error/10 rounded-lg transition-colors ml-2"
                                    disabled={savingPortfolioId === portfolio._id}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
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
