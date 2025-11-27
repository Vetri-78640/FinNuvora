'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { plaidAPI } from '@/lib/api';
import { Building2, CheckCircle, Loader2 } from 'lucide-react';

export default function BankConnect() {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [isConfigured, setIsConfigured] = useState(true);

    // 1. Create Link Token on mount
    useEffect(() => {
        const createLinkToken = async () => {
            try {
                const response = await plaidAPI.createLinkToken();
                setToken(response.data.link_token);
            } catch (err) {
                console.error('Error creating link token', err);
                // Hide component if Plaid is not configured
                if (err.response?.status === 500) {
                    setIsConfigured(false);
                }
            }
        };
        createLinkToken();
    }, []);

    // 2. Handle Success (Exchange public token)
    const onSuccess = useCallback(async (public_token) => {
        setLoading(true);
        try {
            await plaidAPI.setAccessToken(public_token);
            setConnected(true);
            // Auto-sync after connection
            syncTransactions();
        } catch (err) {
            console.error('Error exchanging token', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // 3. Sync Transactions
    const syncTransactions = async () => {
        setSyncing(true);
        try {
            const res = await plaidAPI.syncTransactions();
            alert(`Synced ${res.data.added} transactions!`);
            window.location.reload(); // Refresh to show new data
        } catch (err) {
            console.error('Error syncing transactions', err);
        } finally {
            setSyncing(false);
        }
    };

    const config = {
        token,
        onSuccess,
    };

    const { open, ready } = usePlaidLink(config);

    // Don't render if Plaid is not configured (AFTER all hooks)
    if (!isConfigured) {
        return null;
    }

    if (!token) {
        return (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Loader2 className="animate-spin" size={16} />
                Preparing secure connection...
            </div>
        );
    }

    if (connected) {
        return (
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg border border-emerald-400/20">
                    <CheckCircle size={16} />
                    <span className="font-medium text-sm">Bank Connected</span>
                </div>
                <button
                    onClick={syncTransactions}
                    disabled={syncing}
                    className="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50"
                >
                    {syncing ? 'Syncing...' : 'Sync Now'}
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => open()}
            disabled={!ready || loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Building2 size={16} />}
            Connect Bank
        </button>
    );
}
