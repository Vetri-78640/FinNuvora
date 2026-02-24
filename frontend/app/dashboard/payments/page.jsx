'use client';

import { useState, useEffect } from 'react';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { paymentAPI } from '@/lib/api';
import { useCurrency } from '@/lib/contexts/CurrencyContext';
import {
    Send, ArrowDownLeft, ArrowUpRight, Plus, X,
    Check, XCircle, Clock, Mail, MessageSquare, RefreshCw
} from 'lucide-react';
import Button from '@/components/ui/Button';

export default function PaymentsPage() {
    useProtectedRoute();
    const { formatCurrency } = useCurrency();

    const [sent, setSent] = useState([]);
    const [received, setReceived] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSendModal, setShowSendModal] = useState(false);
    const [activeTab, setActiveTab] = useState('received');
    const [form, setForm] = useState({ toEmail: '', amount: '', description: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchRequests = async () => {
        try {
            const res = await paymentAPI.getRequests();
            setSent(res.data.data.sent || []);
            setReceived(res.data.data.received || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await paymentAPI.createRequest(form);
            setSuccess('Payment request sent!');
            setShowSendModal(false);
            setForm({ toEmail: '', amount: '', description: '' });
            fetchRequests();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send request');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRespond = async (id, status) => {
        try {
            await paymentAPI.respondToRequest(id, status);
            fetchRequests();
        } catch (err) {
            console.error(err);
        }
    };

    const statusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-500/10 text-yellow-500',
            accepted: 'bg-green-500/10 text-green-500',
            declined: 'bg-red-500/10 text-red-500',
        };
        const icons = {
            pending: <Clock size={12} />,
            accepted: <Check size={12} />,
            declined: <XCircle size={12} />,
        };
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
                {icons[status]}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const pendingReceived = received.filter(r => r.status === 'pending').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-3">
                        <Send className="text-blue-500" size={28} />
                        Payment Requests
                    </h1>
                    <p className="text-text-secondary mt-1">Send and manage payment requests with other users</p>
                </div>
                <Button onClick={() => setShowSendModal(true)} className="gap-2">
                    <Plus size={16} />
                    New Request
                </Button>
            </div>

            {success && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-500 text-sm flex items-center gap-2">
                    <Check size={16} /> {success}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-surface rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('received')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'received' ? 'bg-primary text-background' : 'text-text-secondary hover:text-text-primary'
                        }`}
                >
                    <ArrowDownLeft size={16} />
                    Received
                    {pendingReceived > 0 && (
                        <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{pendingReceived}</span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('sent')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'sent' ? 'bg-primary text-background' : 'text-text-secondary hover:text-text-primary'
                        }`}
                >
                    <ArrowUpRight size={16} />
                    Sent
                </button>
            </div>

            {/* Request List */}
            <div className="card overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <RefreshCw size={24} className="animate-spin mx-auto text-text-secondary mb-3" />
                        <p className="text-text-secondary">Loading requests...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'received' && (
                            received.length === 0 ? (
                                <div className="p-12 text-center">
                                    <ArrowDownLeft size={48} className="mx-auto text-blue-500/20 mb-4" />
                                    <p className="text-text-secondary">No payment requests received yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {received.map((req) => (
                                        <div key={req._id} className="p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-text-primary">{req.fromUserName}</p>
                                                <p className="text-sm text-text-secondary mt-0.5">
                                                    {req.description || 'Payment request'}
                                                </p>
                                                <p className="text-xs text-text-tertiary mt-1">
                                                    {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-text-primary">{formatCurrency(req.amount)}</p>
                                                {statusBadge(req.status)}
                                            </div>
                                            {req.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleRespond(req._id, 'accepted')}
                                                        className="px-4 py-2 bg-green-500/10 text-green-500 rounded-xl text-sm font-medium hover:bg-green-500/20 transition-colors flex items-center gap-1.5"
                                                    >
                                                        <Check size={14} /> Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleRespond(req._id, 'declined')}
                                                        className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
                                                    >
                                                        <XCircle size={14} /> Decline
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )
                        )}

                        {activeTab === 'sent' && (
                            sent.length === 0 ? (
                                <div className="p-12 text-center">
                                    <ArrowUpRight size={48} className="mx-auto text-blue-500/20 mb-4" />
                                    <p className="text-text-secondary">No payment requests sent yet</p>
                                    <Button onClick={() => setShowSendModal(true)} className="mt-4 gap-2">
                                        <Plus size={16} /> Send Request
                                    </Button>
                                </div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {sent.map((req) => (
                                        <div key={req._id} className="p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <Mail size={14} className="text-text-secondary" />
                                                    <p className="font-bold text-text-primary">{req.toEmail}</p>
                                                </div>
                                                <p className="text-sm text-text-secondary mt-0.5">
                                                    {req.description || 'Payment request'}
                                                </p>
                                                <p className="text-xs text-text-tertiary mt-1">
                                                    {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-text-primary">{formatCurrency(req.amount)}</p>
                                                {statusBadge(req.status)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </>
                )}
            </div>

            {/* Send Request Modal */}
            {showSendModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowSendModal(false); setError(''); }} />
                    <div className="relative bg-surface border border-border rounded-3xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-text-primary">Send Payment Request</h3>
                            <button onClick={() => { setShowSendModal(false); setError(''); }} className="p-2 rounded-full hover:bg-white/10 text-text-secondary">
                                <X size={20} />
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-500 text-sm mb-4">{error}</div>
                        )}

                        <form onSubmit={handleSend} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Recipient Email</label>
                                <input
                                    type="email"
                                    value={form.toEmail}
                                    onChange={(e) => setForm(f => ({ ...f, toEmail: e.target.value }))}
                                    placeholder="user@example.com"
                                    required
                                    className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={form.amount}
                                    onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                                    placeholder="0.00"
                                    required
                                    className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Note (optional)</label>
                                <input
                                    type="text"
                                    value={form.description}
                                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="What's this for?"
                                    maxLength={200}
                                    className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary"
                                />
                            </div>
                            <Button type="submit" disabled={submitting} className="w-full justify-center py-3">
                                {submitting ? 'Sending...' : 'Send Request'}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
