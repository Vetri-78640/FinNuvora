import { useState, useCallback, useEffect } from 'react';
import { transactionAPI, categoryAPI } from '@/lib/api';
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

export function useTransactions() {
    const { convertToUSD } = useCurrency();

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
    const [uploading, setUploading] = useState(false);
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

            // Clean filters
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

    const deleteTransaction = async (id) => {
        try {
            await transactionAPI.deleteTransaction(id);
            setSuccess('Transaction deleted successfully');
            setTimeout(() => setSuccess(''), 3000);
            await loadTransactions();
            return true;
        } catch (err) {
            setError(
                err.response?.data?.error ||
                'Failed to delete transaction. Please try again.'
            );
            return false;
        }
    };

    const bulkDelete = async () => {
        if (selectedIds.size === 0) return;
        try {
            await transactionAPI.bulkDelete(Array.from(selectedIds));
            setSuccess(`${selectedIds.size} transactions deleted successfully`);
            setSelectedIds(new Set());
            await loadTransactions();
            setTimeout(() => setSuccess(''), 3000);
            return true;
        } catch (err) {
            setError(
                err.response?.data?.error ||
                'Failed to delete transactions. Please try again.'
            );
            return false;
        }
    };

    const saveTransaction = async (data, isUpdate = false, id = null) => {
        try {
            setError('');
            setSuccess('');

            const payload = {
                ...data,
                amount: Number(data.amount),
            };

            if (data.categoryId === 'other') {
                payload.categoryName = data.customCategory;
                delete payload.categoryId;
                delete payload.customCategory;
            }

            if (isUpdate && id) {
                await transactionAPI.updateTransaction(id, payload);
                setSuccess('Transaction updated successfully');
            } else {
                await transactionAPI.createTransaction(payload);
                setSuccess('Transaction added successfully');
            }

            setTimeout(() => setSuccess(''), 3000);
            await loadTransactions();
            await loadCategories();
            return true;
        } catch (err) {
            setError(
                err.response?.data?.error ||
                `Failed to ${isUpdate ? 'update' : 'create'} transaction. Please try again.`
            );
            return false;
        }
    };

    const uploadPDF = async (file) => {
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
                setTimeout(() => setSuccess(''), 5000);
            }
        } catch (err) {
            console.error('Upload error:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Failed to upload PDF';
            setError(`Error: ${errorMessage}`);
        } finally {
            setUploading(false);
        }
    };

    return {
        transactions,
        categories,
        loading,
        error,
        success,
        pagination,
        filters,
        selectedIds,
        uploading,
        handleFilterChange,
        resetFilters,
        toggleSelection,
        toggleAll,
        deleteTransaction,
        bulkDelete,
        saveTransaction,
        uploadPDF,
        setSuccess,
        setError
    };
}
