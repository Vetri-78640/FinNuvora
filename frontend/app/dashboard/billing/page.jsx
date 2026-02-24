'use client';

import { useState, useEffect } from 'react';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { subscriptionAPI } from '@/lib/api';
import {
    CreditCard, Check, Crown, AlertCircle
} from 'lucide-react';
import Button from '@/components/ui/Button';

const plans = [
    {
        id: 'free',
        name: 'Starter',
        price: '$0',
        features: ['Manual Transactions', 'Basic Dashboard', '1 Portfolio', 'Community Support'],
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '$12',
        popular: true,
        features: ['Unlimited Bank Connections', 'AI Financial Advisor', 'Unlimited Portfolios', 'Crypto Tracking', 'Priority Support'],
    },
    {
        id: 'business',
        name: 'Business',
        price: '$49',
        features: ['Multi-User Access', 'Client Management', 'API Access', 'White-label Reports', 'Dedicated Account Manager'],
    },
];

export default function BillingPage() {
    useProtectedRoute();

    const [currentPlan, setCurrentPlan] = useState('free');
    const [periodEnd, setPeriodEnd] = useState(null);
    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState(null);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.search.includes('success=true')) {
            setSuccess('Subscription activated!');
            setTimeout(() => setSuccess(''), 5000);
        }
    }, []);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const res = await subscriptionAPI.getCurrent();
                setCurrentPlan(res.data.data.plan);
                setPeriodEnd(res.data.data.currentPeriodEnd);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlan();
    }, []);

    const handleUpgrade = async (plan) => {
        setUpgrading(plan);
        try {
            const res = await subscriptionAPI.checkout(plan);
            if (res.data.url) {
                window.location.href = res.data.url;
            } else {
                setCurrentPlan(plan);
                setSuccess(res.data.message || `Upgraded to ${plan}!`);
                setTimeout(() => setSuccess(''), 5000);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUpgrading(null);
        }
    };

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel your subscription?')) return;
        try {
            await subscriptionAPI.cancel();
            setCurrentPlan('free');
            setPeriodEnd(null);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-3">
                    <CreditCard className="text-primary" size={28} />
                    Billing & Subscription
                </h1>
                <p className="text-text-secondary mt-1">Manage your FinNuvora subscription plan</p>
            </div>

            {success && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-500 text-sm flex items-center gap-2">
                    <Check size={16} /> {success}
                </div>
            )}

            <div className="card p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-text-secondary mb-1">Current Plan</p>
                        <div className="flex items-center gap-2">
                            <Crown size={20} className={currentPlan === 'free' ? 'text-gray-500' : 'text-primary'} />
                            <span className="text-xl font-bold text-text-primary capitalize">{currentPlan}</span>
                            {currentPlan !== 'free' && (
                                <span className="px-2.5 py-0.5 bg-green-500/10 text-green-500 rounded-full text-xs font-medium">Active</span>
                            )}
                        </div>
                        {periodEnd && (
                            <p className="text-xs text-text-tertiary mt-1">
                                Renews {new Date(periodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                        )}
                    </div>
                    {currentPlan !== 'free' && (
                        <Button variant="ghost" onClick={handleCancel} className="text-red-500 hover:bg-red-500/10">
                            Cancel Plan
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => {
                    const isCurrent = currentPlan === plan.id;
                    return (
                        <div
                            key={plan.id}
                            className={`relative card p-6 flex flex-col ${plan.popular ? 'border-primary/50 shadow-lg shadow-primary/5' : ''} ${isCurrent ? 'ring-2 ring-primary' : ''}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-background text-xs font-bold rounded-full">
                                    Most Popular
                                </div>
                            )}
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-text-primary">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mt-2">
                                    <span className="text-3xl font-bold text-text-primary">{plan.price}</span>
                                    <span className="text-text-secondary">/mo</span>
                                </div>
                            </div>
                            <ul className="space-y-3 mb-6 flex-1">
                                {plan.features.map((f, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                                        <Check size={16} className={plan.popular ? 'text-primary' : 'text-text-secondary'} />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            {isCurrent ? (
                                <div className="py-2.5 text-center text-sm font-medium text-text-secondary border border-border rounded-xl">
                                    Current Plan
                                </div>
                            ) : (
                                <Button
                                    onClick={() => handleUpgrade(plan.id)}
                                    disabled={upgrading === plan.id}
                                    variant={plan.popular ? 'primary' : 'secondary'}
                                    className="w-full justify-center"
                                >
                                    {upgrading === plan.id ? 'Processing...' : plan.id === 'free' ? 'Downgrade' : 'Upgrade'}
                                </Button>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="card p-4 md:p-6 border-yellow-500/20 bg-yellow-500/5">
                <div className="flex items-start gap-3">
                    <AlertCircle size={18} className="text-yellow-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-text-secondary">
                        <strong className="text-yellow-500">Demo Mode:</strong> Stripe is not configured. Upgrading will simulate a plan change.
                        To enable real payments, add <code className="text-primary">STRIPE_SECRET_KEY</code> to your backend environment.
                    </p>
                </div>
            </div>
        </div>
    );
}
