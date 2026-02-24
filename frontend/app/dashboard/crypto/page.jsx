'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { cryptoAPI } from '@/lib/api';
import { useCurrency } from '@/lib/contexts/CurrencyContext';
import {
    Bitcoin, Plus, Search, TrendingUp, TrendingDown, Trash2, Edit,
    X, Wallet, BarChart3, ArrowUpRight, ArrowDownRight, RefreshCw, Coins
} from 'lucide-react';
import Button from '@/components/ui/Button';

export default function CryptoPage() {
    useProtectedRoute();
    const { formatCurrency } = useCurrency();

    const [holdings, setHoldings] = useState([]);
    const [marketData, setMarketData] = useState({});
    const [loading, setLoading] = useState(true);
    const [marketLoading, setMarketLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editHolding, setEditHolding] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [form, setForm] = useState({ quantity: '', avgBuyPrice: '' });
    const [submitting, setSubmitting] = useState(false);
    const searchTimeout = useRef(null);

    const fetchHoldings = useCallback(async () => {
        try {
            const res = await cryptoAPI.getHoldings();
            setHoldings(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch holdings:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMarketData = useCallback(async (holdingsList) => {
        if (!holdingsList || holdingsList.length === 0) return;
        const ids = holdingsList.map(h => h.coinId).join(',');
        setMarketLoading(true);
        try {
            const res = await cryptoAPI.getMarketData(ids);
            const dataMap = {};
            (res.data.data || []).forEach(coin => {
                dataMap[coin.id] = coin;
            });
            setMarketData(dataMap);
        } catch (err) {
            console.error('Market data fetch failed:', err);
        } finally {
            setMarketLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHoldings();
    }, [fetchHoldings]);

    useEffect(() => {
        if (holdings.length > 0) {
            fetchMarketData(holdings);
        }
    }, [holdings, fetchMarketData]);

    // Search coins
    const handleSearch = (q) => {
        setSearchQuery(q);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        if (!q.trim()) { setSearchResults([]); return; }
        searchTimeout.current = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await cryptoAPI.searchCoins(q);
                setSearchResults(res.data.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setSearching(false);
            }
        }, 400);
    };

    const handleSelectCoin = (coin) => {
        setSelectedCoin(coin);
        setSearchQuery(coin.name);
        setSearchResults([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCoin && !editHolding) return;
        setSubmitting(true);
        try {
            if (editHolding) {
                await cryptoAPI.updateHolding(editHolding._id, {
                    quantity: Number(form.quantity),
                    avgBuyPrice: Number(form.avgBuyPrice),
                });
            } else {
                await cryptoAPI.addHolding({
                    coinId: selectedCoin.id,
                    symbol: selectedCoin.symbol,
                    name: selectedCoin.name,
                    quantity: Number(form.quantity),
                    avgBuyPrice: Number(form.avgBuyPrice),
                });
            }
            setShowAddModal(false);
            setEditHolding(null);
            setSelectedCoin(null);
            setSearchQuery('');
            setForm({ quantity: '', avgBuyPrice: '' });
            fetchHoldings();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Remove this holding?')) return;
        try {
            await cryptoAPI.deleteHolding(id);
            fetchHoldings();
        } catch (err) {
            console.error(err);
        }
    };

    const openEdit = (holding) => {
        setEditHolding(holding);
        setForm({ quantity: holding.quantity.toString(), avgBuyPrice: holding.avgBuyPrice.toString() });
        setSearchQuery(holding.name);
        setSelectedCoin({ id: holding.coinId, symbol: holding.symbol, name: holding.name });
        setShowAddModal(true);
    };

    const closeModal = () => {
        setShowAddModal(false);
        setEditHolding(null);
        setSelectedCoin(null);
        setSearchQuery('');
        setSearchResults([]);
        setForm({ quantity: '', avgBuyPrice: '' });
    };

    // Calculate portfolio totals
    const totalValue = holdings.reduce((sum, h) => {
        const price = marketData[h.coinId]?.current_price || 0;
        return sum + (h.quantity * price);
    }, 0);

    const totalCost = holdings.reduce((sum, h) => sum + (h.quantity * h.avgBuyPrice), 0);
    const totalPnL = totalValue - totalCost;
    const totalPnLPercent = totalCost > 0 ? ((totalPnL / totalCost) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-3">
                        <Bitcoin className="text-orange-500" size={28} />
                        Crypto Portfolio
                    </h1>
                    <p className="text-text-secondary mt-1">Track your cryptocurrency holdings with live prices</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => fetchMarketData(holdings)}
                        disabled={marketLoading}
                        className="gap-2"
                    >
                        <RefreshCw size={16} className={marketLoading ? 'animate-spin' : ''} />
                        Refresh
                    </Button>
                    <Button onClick={() => setShowAddModal(true)} className="gap-2">
                        <Plus size={16} />
                        Add Holding
                    </Button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <Wallet size={20} className="text-orange-500" />
                        </div>
                        <span className="text-sm text-text-secondary">Total Value</span>
                    </div>
                    <p className="text-2xl font-bold text-text-primary">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>

                <div className="card p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Coins size={20} className="text-blue-500" />
                        </div>
                        <span className="text-sm text-text-secondary">Total Cost</span>
                    </div>
                    <p className="text-2xl font-bold text-text-primary">${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>

                <div className="card p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${totalPnL >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                            {totalPnL >= 0 ? <TrendingUp size={20} className="text-green-500" /> : <TrendingDown size={20} className="text-red-500" />}
                        </div>
                        <span className="text-sm text-text-secondary">Total P&L</span>
                    </div>
                    <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {totalPnL >= 0 ? '+' : ''}{totalPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span className="text-sm ml-2">({totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%)</span>
                    </p>
                </div>
            </div>

            {/* Holdings List */}
            <div className="card overflow-hidden">
                <div className="p-4 md:p-6 border-b border-border">
                    <h2 className="text-lg font-bold text-text-primary">Holdings</h2>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <RefreshCw size={24} className="animate-spin mx-auto text-text-secondary mb-3" />
                        <p className="text-text-secondary">Loading holdings...</p>
                    </div>
                ) : holdings.length === 0 ? (
                    <div className="p-12 text-center">
                        <Bitcoin size={48} className="mx-auto text-orange-500/30 mb-4" />
                        <p className="text-text-secondary text-lg mb-2">No crypto holdings yet</p>
                        <p className="text-text-tertiary text-sm mb-6">Add your first cryptocurrency holding to start tracking</p>
                        <Button onClick={() => setShowAddModal(true)} className="gap-2">
                            <Plus size={16} /> Add Holding
                        </Button>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {holdings.map((holding) => {
                            const market = marketData[holding.coinId];
                            const currentPrice = market?.current_price || 0;
                            const value = holding.quantity * currentPrice;
                            const cost = holding.quantity * holding.avgBuyPrice;
                            const pnl = value - cost;
                            const pnlPercent = cost > 0 ? ((pnl / cost) * 100) : 0;
                            const priceChange24h = market?.price_change_percentage_24h || 0;
                            const sparkline = market?.sparkline_in_7d?.price || [];

                            return (
                                <div key={holding._id} className="p-4 md:p-6 hover:bg-surface-elevated/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        {/* Coin Info */}
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            {market?.image ? (
                                                <img src={market.image} alt={holding.name} className="w-10 h-10 rounded-full" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                                                    <Bitcoin size={20} className="text-orange-500" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="font-bold text-text-primary truncate">{holding.name}</p>
                                                <p className="text-sm text-text-secondary">{holding.symbol} · {holding.quantity} units</p>
                                            </div>
                                        </div>

                                        {/* Sparkline */}
                                        {sparkline.length > 0 && (
                                            <div className="hidden md:block w-24 h-10">
                                                <svg viewBox={`0 0 ${sparkline.length} 40`} className="w-full h-full" preserveAspectRatio="none">
                                                    <polyline
                                                        fill="none"
                                                        stroke={pnl >= 0 ? '#22c55e' : '#ef4444'}
                                                        strokeWidth="2"
                                                        points={sparkline.map((p, i) => {
                                                            const min = Math.min(...sparkline);
                                                            const max = Math.max(...sparkline);
                                                            const range = max - min || 1;
                                                            return `${i},${40 - ((p - min) / range) * 38}`;
                                                        }).join(' ')}
                                                    />
                                                </svg>
                                            </div>
                                        )}

                                        {/* Price */}
                                        <div className="text-right hidden sm:block">
                                            <p className="font-bold text-text-primary">${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                            <p className={`text-sm flex items-center justify-end gap-1 ${priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {priceChange24h >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                {Math.abs(priceChange24h).toFixed(2)}%
                                            </p>
                                        </div>

                                        {/* Value & P&L */}
                                        <div className="text-right">
                                            <p className="font-bold text-text-primary">${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                            <p className={`text-sm ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => openEdit(holding)}
                                                className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(holding._id)}
                                                className="p-2 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative bg-surface border border-border rounded-3xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-text-primary">
                                {editHolding ? 'Edit Holding' : 'Add Crypto Holding'}
                            </h3>
                            <button onClick={closeModal} className="p-2 rounded-full hover:bg-white/10 text-text-secondary">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Coin Search */}
                            {!editHolding && (
                                <div className="relative">
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Search Coin</label>
                                    <div className="relative">
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            placeholder="Search Bitcoin, Ethereum..."
                                            className="w-full pl-10 pr-4 py-3 bg-surface-elevated border border-border rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                    {searchResults.length > 0 && (
                                        <div className="absolute z-10 w-full mt-2 bg-surface-elevated border border-border rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                                            {searchResults.map((coin) => (
                                                <button
                                                    key={coin.id}
                                                    type="button"
                                                    onClick={() => handleSelectCoin(coin)}
                                                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 text-left transition-colors"
                                                >
                                                    {coin.thumb && <img src={coin.thumb} alt="" className="w-6 h-6 rounded-full" />}
                                                    <span className="text-text-primary font-medium">{coin.name}</span>
                                                    <span className="text-text-secondary text-sm">{coin.symbol}</span>
                                                    {coin.marketCapRank && <span className="text-text-tertiary text-xs ml-auto">#{coin.marketCapRank}</span>}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {selectedCoin && (
                                        <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg text-sm text-primary">
                                            <Bitcoin size={14} />
                                            Selected: {selectedCoin.name} ({selectedCoin.symbol})
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Quantity</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={form.quantity}
                                    onChange={(e) => setForm(f => ({ ...f, quantity: e.target.value }))}
                                    placeholder="e.g. 0.5"
                                    required
                                    className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Average Buy Price (USD)</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={form.avgBuyPrice}
                                    onChange={(e) => setForm(f => ({ ...f, avgBuyPrice: e.target.value }))}
                                    placeholder="e.g. 45000"
                                    required
                                    className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={submitting || (!editHolding && !selectedCoin)}
                                className="w-full justify-center py-3"
                            >
                                {submitting ? 'Saving...' : editHolding ? 'Update Holding' : 'Add Holding'}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
