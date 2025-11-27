'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle2, Circle, Clock, ArrowRight, Star, CircleDot } from 'lucide-react';

export default function RoadmapPage() {
    const roadmapItems = [
        {
            quarter: 'Q1 2024',
            status: 'completed',
            title: 'Foundation & Core Features',
            items: [
                'Secure User Authentication (JWT)',
                'Dashboard Overview with Real-time Data',
                'Transaction Management & Categorization',
                'Basic Portfolio Tracking',
                'Dark Mode Implementation'
            ]
        },
        {
            quarter: 'Q2 2024',
            status: 'in-progress',
            title: 'AI Insights & Advanced Analytics',
            items: [
                'AI-Powered Financial Advisor (Beta)',
                'Smart Budgeting & Expense Forecasting',
                'Investment Performance Analysis',
                'Goal Setting & Progress Tracking',
                'Mobile Responsive Design Polish'
            ]
        },
        {
            quarter: 'Q3 2024',
            status: 'planned',
            title: 'Community & Integration',
            items: [
                'Bank Account Integration (Plaid/Yodlee)',
                'Social Investment Features',
                'Export Reports (PDF/CSV)',
                'Customizable Widgets',
                'Multi-currency Support'
            ]
        },
        {
            quarter: 'Q4 2024',
            status: 'planned',
            title: 'Expansion & Ecosystem',
            items: [
                'Mobile App Launch (iOS & Android)',
                'Advanced Tax Optimization Tools',
                'Crypto Wallet Integration',
                'Peer-to-Peer Payments',
                'Premium Subscription Tiers'
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-[#000000] text-text-primary font-sans selection:bg-primary/20">
            <Navbar />

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-20 space-y-4 animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                            <Star size={16} className="fill-primary" />
                            <span>Our Journey & Future</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
                            Product Roadmap
                        </h1>
                        <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
                            See what we've built and explore the exciting features coming to FinNuvora.
                            We're constantly evolving to help you master your finances.
                        </p>
                    </div>

                    {/* Timeline */}
                    <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                        {roadmapItems.map((phase, index) => (
                            <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">

                                {/* Icon/Dot */}
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-surface shadow-xl shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 group-hover:scale-110 transition-transform duration-300">
                                    {phase.status === 'completed' ? (
                                        <CheckCircle2 size={20} className="text-success" />
                                    ) : phase.status === 'in-progress' ? (
                                        <Clock size={20} className="text-primary animate-pulse" />
                                    ) : (
                                        <CircleDot size={20} className="text-blue-500" />
                                    )}
                                </div>

                                {/* Content Card */}
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-3xl bg-surface/50 border border-white/5 backdrop-blur-sm hover:bg-surface hover:border-primary/20 transition-all duration-300 shadow-lg group-hover:shadow-primary/5">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`text-sm font-bold px-3 py-1 rounded-full ${phase.status === 'completed' ? 'bg-success/10 text-success' :
                                            phase.status === 'in-progress' ? 'bg-primary/10 text-primary' :
                                                'bg-blue-500/10 text-blue-500'
                                            }`}>
                                            {phase.quarter}
                                        </span>
                                        <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
                                            {phase.status.replace('-', ' ')}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-text-primary mb-4 group-hover:text-primary transition-colors">
                                        {phase.title}
                                    </h3>

                                    <ul className="space-y-3">
                                        {phase.items.map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
                                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-border group-hover:bg-primary/50 transition-colors" />
                                                <span className="group-hover:text-text-primary transition-colors">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                </div>
            </main>

            <Footer />
        </div>
    );
}
