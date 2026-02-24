const Transaction = require('../models/Transaction');

// GET /api/tax/summary?year=2025
exports.getTaxSummary = async (req, res) => {
    try {
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${year + 1}-01-01`);

        const transactions = await Transaction.find({
            user: req.userId,
            date: { $gte: startDate, $lt: endDate },
        });

        // Aggregate by type
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const investments = transactions
            .filter(t => t.type === 'investment')
            .reduce((sum, t) => sum + t.amount, 0);

        // Category-wise breakdown
        const categoryBreakdown = {};
        transactions.forEach(t => {
            const cat = t.category?.toString() || 'uncategorized';
            if (!categoryBreakdown[cat]) {
                categoryBreakdown[cat] = { income: 0, expense: 0, investment: 0 };
            }
            categoryBreakdown[cat][t.type] += t.amount;
        });

        // Monthly breakdown
        const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            income: 0,
            expense: 0,
            investment: 0,
        }));

        transactions.forEach(t => {
            const month = new Date(t.date).getMonth();
            monthlyBreakdown[month][t.type] += t.amount;
        });

        // Simple tax estimation (configurable slabs)
        const taxableIncome = income - expenses;
        let estimatedTax = 0;

        if (taxableIncome > 0) {
            // Simple progressive tax brackets (India-style)
            const slabs = [
                { limit: 300000, rate: 0 },
                { limit: 600000, rate: 0.05 },
                { limit: 900000, rate: 0.10 },
                { limit: 1200000, rate: 0.15 },
                { limit: 1500000, rate: 0.20 },
                { limit: Infinity, rate: 0.30 },
            ];

            let remaining = taxableIncome;
            let prevLimit = 0;
            for (const slab of slabs) {
                const taxable = Math.min(remaining, slab.limit - prevLimit);
                if (taxable <= 0) break;
                estimatedTax += taxable * slab.rate;
                remaining -= taxable;
                prevLimit = slab.limit;
            }
        }

        res.json({
            success: true,
            data: {
                year,
                income,
                expenses,
                investments,
                taxableIncome: Math.max(0, taxableIncome),
                estimatedTax,
                effectiveRate: taxableIncome > 0 ? (estimatedTax / taxableIncome * 100) : 0,
                monthlyBreakdown,
                transactionCount: transactions.length,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// GET /api/tax/export?year=2025
exports.exportTaxCSV = async (req, res) => {
    try {
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${year + 1}-01-01`);

        const transactions = await Transaction.find({
            user: req.userId,
            date: { $gte: startDate, $lt: endDate },
        }).sort({ date: 1 });

        const header = 'Date,Type,Amount,Description\n';
        const rows = transactions.map(t =>
            `${new Date(t.date).toISOString().slice(0, 10)},${t.type},${t.amount},"${(t.description || '').replace(/"/g, '""')}"`
        ).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=tax_summary_${year}.csv`);
        res.send(header + rows);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
