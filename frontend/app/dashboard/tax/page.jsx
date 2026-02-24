'use client';

import { useState, useEffect } from 'react';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { taxAPI } from '@/lib/api';
import { useCurrency } from '@/lib/contexts/CurrencyContext';
import {
    Receipt, TrendingUp, TrendingDown, DollarSign, Download,
    Calendar, PieChart, BarChart3, ArrowRight, ChevronDown
} from 'lucide-react';
import Button from '@/components/ui/Button';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function TaxPage() {
    useProtectedRoute();
    const { formatCurrency } = useCurrency();

    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await taxAPI.getSummary(year);
                setData(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [year]);

    const handleExport = async () => {
        try {
            const res = await taxAPI.exportCSV(year);
            const blob = new Blob([res.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tax_summary_${year}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
        }
    };

    const maxMonthlyValue = data?.monthlyBreakdown
        ? Math.max(...data.monthlyBreakdown.map(m => Math.max(m.income, m.expense)))
        : 1;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-3">
                        <Receipt className="text-emerald-500" size={28} />
                        Tax Summary
                    </h1>
                    <p className="text-text-secondary mt-1">Your financial summary for tax preparation</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <select
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="appearance-none bg-surface-elevated border border-border rounded-xl px-4 py-2.5 pr-10 text-text-primary text-sm font-medium focus:outline-none focus:border-primary cursor-pointer"
                        >
                            {[currentYear, currentYear - 1, currentYear - 2, currentYear - 3].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                    </div>
                    <Button variant="ghost" onClick={handleExport} className="gap-2">
                        <Download size={16} />
                        Export CSV
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="card p-12 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
                    <p className="text-text-secondary">Calculating tax summary...</p>
                </div>
            ) : data ? (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="card p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp size={18} className="text-green-500" />
                                <span className="text-sm text-text-secondary">Total Income</span>
                            </div>
                            <p className="text-xl font-bold text-green-500">{formatCurrency(data.income)}</p>
                        </div>

                        <div className="card p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingDown size={18} className="text-red-500" />
                                <span className="text-sm text-text-secondary">Total Expenses</span>
                            </div>
                            <p className="text-xl font-bold text-red-500">{formatCurrency(data.expenses)}</p>
                        </div>

                        <div className="card p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign size={18} className="text-primary" />
                                <span className="text-sm text-text-secondary">Taxable Income</span>
                            </div>
                            <p className="text-xl font-bold text-text-primary">{formatCurrency(data.taxableIncome)}</p>
                        </div>

                        <div className="card p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <Receipt size={18} className="text-orange-500" />
                                <span className="text-sm text-text-secondary">Estimated Tax</span>
                            </div>
                            <p className="text-xl font-bold text-orange-500">{formatCurrency(data.estimatedTax)}</p>
                            <p className="text-xs text-text-tertiary mt-1">{data.effectiveRate.toFixed(1)}% effective rate</p>
                        </div>
                    </div>

                    {/* Monthly Breakdown Chart */}
                    <div className="card p-4 md:p-6">
                        <h2 className="text-lg font-bold text-text-primary mb-6">Monthly Breakdown</h2>
                        <div className="space-y-3">
                            {data.monthlyBreakdown.map((month, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <span className="text-sm text-text-secondary w-8 shrink-0">{monthNames[idx]}</span>
                                    <div className="flex-1 flex gap-1 h-6">
                                        <div
                                            className="bg-green-500/80 rounded-l-md h-full transition-all duration-500"
                                            style={{ width: `${maxMonthlyValue > 0 ? (month.income / maxMonthlyValue) * 100 : 0}%` }}
                                            title={`Income: ${formatCurrency(month.income)}`}
                                        />
                                        <div
                                            className="bg-red-500/80 rounded-r-md h-full transition-all duration-500"
                                            style={{ width: `${maxMonthlyValue > 0 ? (month.expense / maxMonthlyValue) * 100 : 0}%` }}
                                            title={`Expense: ${formatCurrency(month.expense)}`}
                                        />
                                    </div>
                                    <span className="text-xs text-text-tertiary w-20 text-right shrink-0">
                                        {formatCurrency(month.income - month.expense)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm bg-green-500/80" />
                                <span className="text-xs text-text-secondary">Income</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm bg-red-500/80" />
                                <span className="text-xs text-text-secondary">Expenses</span>
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="card p-4 md:p-6 border-primary/20 bg-primary/5">
                        <p className="text-sm text-text-secondary">
                            <strong className="text-primary">Note:</strong> The estimated tax is calculated using simplified progressive tax brackets for reference purposes only.
                            Please consult a tax professional for accurate tax planning. Exported CSV can be shared with your accountant.
                        </p>
                    </div>
                </>
            ) : (
                <div className="card p-12 text-center">
                    <Receipt size={48} className="mx-auto text-emerald-500/30 mb-4" />
                    <p className="text-text-secondary">No transaction data found for {year}</p>
                </div>
            )}
        </div>
    );
}
