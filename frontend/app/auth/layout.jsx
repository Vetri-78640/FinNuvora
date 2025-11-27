'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, TrendingUp, Zap } from 'lucide-react';

export default function AuthLayout({ children }) {
    return (
        <div className="min-h-screen w-full flex bg-black text-text-primary">
            {/* Left Side - Visual & Branding (Hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-surface-elevated flex-col justify-between p-12">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/savemoney.jpg"
                        alt="Authentication Background"
                        className="w-full h-full object-cover object-right"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3 group w-fit">
                        <img src="/logo.svg" alt="FinNuvora Logo" className="w-10 h-10 group-hover:scale-105 transition-transform duration-300" />
                        <span className="font-bold text-2xl text-text-primary tracking-tight">FinNuvora</span>
                    </Link>
                </div>

                <div className="relative z-10 space-y-8 max-w-lg">
                    <h1 className="text-4xl font-bold leading-tight">
                        Master your financial future with <span className="text-primary">AI-driven intelligence</span>.
                    </h1>

                    <div className="space-y-6">
                        <FeatureItem
                            icon={TrendingUp}
                            title="Smart Portfolio Tracking"
                            description="Real-time analytics for all your assets in one place."
                        />
                        <FeatureItem
                            icon={Zap}
                            title="AI-Powered Insights"
                            description="Get personalized recommendations to optimize your wealth."
                        />
                        <FeatureItem
                            icon={Shield}
                            title="Bank-Grade Security"
                            description="Your data is encrypted and protected 24/7."
                        />
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col p-6 md:p-12 relative overflow-y-auto">
                <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                    <Link
                        href="/"
                        className="absolute top-8 left-8 lg:hidden flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back to Home
                    </Link>

                    {children}
                </div>
            </div>
        </div>
    );
}

function FeatureItem({ icon: Icon, title, description }) {
    return (
        <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
                <Icon size={20} className="text-primary" />
            </div>
            <div>
                <h3 className="font-bold text-text-primary">{title}</h3>
                <p className="text-sm text-text-secondary">{description}</p>
            </div>
        </div>
    );
}
