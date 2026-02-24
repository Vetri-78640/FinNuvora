import { useCurrency } from '@/lib/contexts/CurrencyContext';
import { Trash2, Edit } from 'lucide-react';

const typeLabels = {
    income: 'Income',
    expense: 'Expense',
    investment: 'Investment',
};

export default function TransactionTable({
    transactions = [],
    loading = false,
    selectedIds = new Set(),
    onToggleSelect,
    onToggleAll,
    onEdit,
    onDelete,
}) {
    const { formatCurrency } = useCurrency();

    return (
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
                                    onChange={onToggleAll}
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
                                            onChange={() => onToggleSelect(transaction._id)}
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
                                                onClick={() => onEdit(transaction)}
                                                className="p-2 rounded-lg hover:bg-surface text-text-secondary hover:text-primary transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(transaction._id)}
                                                className="p-2 rounded-lg hover:bg-surface text-text-secondary hover:text-error transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
