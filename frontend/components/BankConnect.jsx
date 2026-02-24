'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { plaidAPI } from '@/lib/api';
import { Building2, CheckCircle, Loader2, RefreshCw, Unlink } from 'lucide-react';

export default function BankConnect({ variant = 'full' }) {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [isConfigured, setIsConfigured] = useState(true);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [message, setMessage] = useState(null);

    // 0. Check Plaid connection status on mount
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await plaidAPI.getStatus();
                if (!res.data.configured) {
                    setIsConfigured(false);
                    setCheckingStatus(false);
                    return;
                }
                if (res.data.connected) {
                    setConnected(true);
                }
            } catch (err) {
                console.error('Could not check Plaid status:', err);
                setIsConfigured(false);
            }
            setCheckingStatus(false);
        };
        checkStatus();
    }, []);

    // 1. Create Link Token only if configured and not already connected
    useEffect(() => {
        if (!isConfigured || connected || checkingStatus) return;
        const createLinkToken = async () => {
            try {
                const response = await plaidAPI.createLinkToken();
                setToken(response.data.link_token);
            } catch (err) {
                console.error('Error creating link token', err);
                if (err.response?.status === 500) {
                    setIsConfigured(false);
                }
            }
        };
        createLinkToken();
    }, [isConfigured, connected, checkingStatus]);

    // 2. Handle Success (Exchange public token)
    const onSuccess = useCallback(async (public_token) => {
        setLoading(true);
        try {
            await plaidAPI.setAccessToken(public_token);
            setConnected(true);
            showMessage('Bank connected successfully!', 'success');
            syncTransactions();
        } catch (err) {
            console.error('Error exchanging token', err);
            showMessage('Failed to connect bank', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    // 3. Sync Transactions
    const syncTransactions = async () => {
        setSyncing(true);
        try {
            const res = await plaidAPI.syncTransactions();
            showMessage(`Synced ${res.data.added} transactions!`, 'success');
            // Refresh after a short delay to let the user see the message
            setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
            console.error('Error syncing transactions', err);
            showMessage('Failed to sync transactions', 'error');
        } finally {
            setSyncing(false);
        }
    };

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 4000);
    };

    const config = {
        token,
        onSuccess,
    };

    const { open, ready } = usePlaidLink(config);

    // Don't render if Plaid is not configured
    if (!isConfigured) return null;

    // Loading state while checking status
    if (checkingStatus) {
        return (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Loader2 className="animate-spin" size={16} />
                {variant === 'full' ? 'Checking bank connection...' : ''}
            </div>
        );
    }

    // ── Compact Variant ──
    if (variant === 'compact') {
        if (connected) {
            return (
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-4 py-2.5 rounded-full border border-emerald-400/20 text-sm font-medium">
                        <CheckCircle size={16} />
                        <span>Bank Connected</span>
                    </div>
                    <button
                        onClick={syncTransactions}
                        disabled={syncing}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#1C1C1E] rounded-full text-white hover:bg-white/10 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                        {syncing ? 'Syncing...' : 'Sync'}
                    </button>
                    {message && (
                        <span className={`text-xs font-medium ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {message.text}
                        </span>
                    )}
                </div>
            );
        }
        return (
            <button
                onClick={() => open()}
                disabled={!ready || loading || !token}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Building2 size={16} />}
                Connect Bank
            </button>
        );
    }

    // ── Full Variant (Card) ──
    return (
        <div className="bg-[#000000] p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <Building2 size={18} className="text-blue-400" />
                    Bank Account
                </h3>
                {connected && (
                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
                        <CheckCircle size={12} />
                        Connected
                    </div>
                )}
            </div>

            {/* Message Toast */}
            {message && (
                <div className={`mb-4 px-4 py-2.5 rounded-xl text-sm font-medium ${message.type === 'success'
                    ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                    : 'bg-red-400/10 text-red-400 border border-red-400/20'
                    }`}>
                    {message.text}
                </div>
            )}

            {connected ? (
                <div className="space-y-3">
                    <p className="text-gray-400 text-sm">
                        Your bank account is linked. Sync to import your latest transactions automatically.
                    </p>
                    <button
                        onClick={syncTransactions}
                        disabled={syncing}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 text-sm"
                    >
                        <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                        {syncing ? 'Syncing Transactions...' : 'Sync Transactions'}
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    <p className="text-gray-400 text-sm">
                        Connect your bank to automatically import transactions and keep your finances up to date.
                    </p>
                    {!token ? (
                        <div className="flex items-center justify-center gap-2 py-3 text-slate-400 text-sm">
                            <Loader2 className="animate-spin" size={16} />
                            Preparing secure connection...
                        </div>
                    ) : (
                        <button
                            onClick={() => open()}
                            disabled={!ready || loading}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Building2 size={16} />}
                            Connect Your Bank
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
