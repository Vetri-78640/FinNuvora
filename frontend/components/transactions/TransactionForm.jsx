import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Plus } from 'lucide-react';

const defaultForm = {
    categoryId: '',
    type: 'expense',
    amount: '',
    description: '',
    date: new Date().toISOString().slice(0, 10),
    customCategory: ''
};

export default function TransactionForm({
    initialData = null,
    categories = [],
    onSubmit,
    onCancel,
    isLoading
}) {
    const [form, setForm] = useState(defaultForm);
    const isEditing = !!initialData;

    useEffect(() => {
        if (initialData) {
            setForm({
                categoryId: initialData.category?._id || '',
                type: initialData.type || 'expense',
                amount: initialData.amount || '',
                description: initialData.description || '',
                date: initialData.date ? initialData.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
                customCategory: ''
            });
        } else {
            setForm(defaultForm);
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <div className="card p-6">
            <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                {isEditing ? <span className="text-primary">Edit Transaction</span> : <><Plus size={20} className="text-primary" /> Add New Transaction</>}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-2">
                    <select
                        className="input-field w-full"
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                    >
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                        <option value="investment">Investment</option>
                    </select>
                </div>

                <div className="md:col-span-3">
                    <select
                        className="input-field w-full"
                        value={form.categoryId}
                        onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                        required
                    >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                                {category.name}
                            </option>
                        ))}
                        <option value="other">Other (Custom)</option>
                    </select>
                </div>

                {/* Custom Category Input */}
                {form.categoryId === 'other' && (
                    <div className="md:col-span-3 animate-in fade-in slide-in-from-top-2">
                        <input
                            className="input-field w-full"
                            placeholder="Enter Custom Category"
                            value={form.customCategory}
                            onChange={(e) => setForm({ ...form, customCategory: e.target.value })}
                            required
                        />
                    </div>
                )}

                <div className="md:col-span-2">
                    <input
                        className="input-field w-full"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Amount"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        required
                    />
                </div>

                <div className="md:col-span-3">
                    <input
                        className="input-field w-full"
                        placeholder="Description"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                </div>

                <div className="md:col-span-2">
                    <input
                        className="input-field w-full"
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        required
                    />
                </div>

                <div className="md:col-span-12 flex justify-end gap-3 mt-2">
                    {isEditing && (
                        <Button variant="ghost" onClick={onCancel} type="button">
                            Cancel
                        </Button>
                    )}
                    <Button
                        type="submit"
                        isLoading={isLoading}
                        disabled={isLoading}
                    >
                        {isEditing ? 'Save Changes' : 'Add Transaction'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
