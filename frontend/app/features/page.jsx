'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
    LayoutDashboard,
    Sparkles,
    PieChart,
    Target,
    Shield,
    Smartphone,
    ArrowRight,
    Zap,
    TrendingUp,
    Wallet
} from 'lucide-react';

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-[#000000] text-text-primary font-sans selection:bg-primary/20">
            <Navbar />

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-24 space-y-6 animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 text-sm font-medium mb-4">
                            <Zap size={16} className="fill-purple-500/20" />
                            <span>Powerful Capabilities</span>
                        </div>
                        <h1 className="text-4xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
                            Everything you need to <br /> master your money.
                        </h1>
                        <p className="text-text-secondary text-xl max-w-3xl mx-auto leading-relaxed">
                            FinNuvora isn't just a tracker; it's a comprehensive financial operating system designed to help you build wealth with confidence.
                        </p>
                    </div>

                    {/* Feature Showcase 1: Dashboard */}
                    <div className="flex flex-col lg:flex-row items-center gap-16 mb-32">
                        <div className="flex-1 space-y-8">
                            <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <LayoutDashboard size={32} />
                            </div>
                            <h2 className="text-4xl font-bold text-white">Command Center for Your Finances</h2>
                            <p className="text-text-secondary text-lg leading-relaxed">
                                Stop juggling multiple apps. Our unified dashboard gives you a crystal-clear view of your entire financial life in real-time. From daily spending to long-term investments, see it all at a glance.
                            </p>
                            <ul className="space-y-4">
                                <FeaturePoint text="Real-time Net Worth Tracking" />
                                <FeaturePoint text="Customizable Widgets & Layouts" />
                                <FeaturePoint text="Multi-currency Support" />
                            </ul>
                        </div>
                        <div className="flex-1 relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl opacity-20 group-hover:opacity-40 blur-xl transition duration-500" />
                            <div className="relative bg-[#121212] border border-white/10 rounded-3xl p-8 aspect-video flex flex-col gap-4 overflow-hidden">
                                {/* Mock UI Elements */}
                                {/* Mock UI Elements */}
                                <div className="flex h-full gap-8 relative z-10 items-center">
                                    {/* Left: Glass Card */}
                                    <div className="flex-1 relative group/card perspective-1000">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary to-orange-600 rounded-2xl transform -rotate-6 translate-y-4 opacity-40 blur-xl transition-all duration-500 group-hover/card:opacity-60" />
                                        <div className="relative bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-md rounded-2xl p-6 aspect-[1.58/1] flex flex-col justify-between transform rotate-0 transition-transform duration-500 group-hover/card:rotate-1 group-hover/card:scale-105 shadow-2xl">
                                            <div className="flex justify-between items-start">
                                                <div className="w-12 h-9 bg-yellow-400/20 rounded-md flex items-center justify-center border border-yellow-400/30">
                                                    <div className="w-8 h-6 border border-yellow-400/50 rounded-[2px] grid grid-cols-2 gap-[1px]">
                                                        <div className="bg-yellow-400/20 col-span-1 row-span-2" />
                                                        <div className="bg-yellow-400/20" />
                                                        <div className="bg-yellow-400/20" />
                                                    </div>
                                                </div>
                                                <span className="font-mono text-white/50 text-sm tracking-widest">PREMIUM</span>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="text-2xl text-white font-mono tracking-[0.2em] drop-shadow-md">•••• 4289</div>
                                                <div className="flex justify-between text-[10px] text-white/70 font-medium tracking-wider uppercase">
                                                    <span>Alan Walker</span>
                                                    <span>12/28</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Activity List */}
                                    <div className="flex-1 flex flex-col gap-3 justify-center">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">Recent Activity</div>
                                            <div className="text-xs text-primary cursor-pointer hover:underline">View All</div>
                                        </div>
                                        {/* Item 1 */}
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-elevated border border-white/5 hover:bg-white/5 transition-colors cursor-pointer group/item">
                                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 group-hover/item:scale-110 transition-transform">
                                                <TrendingUp size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-white">Salary Deposit</div>
                                                <div className="text-xs text-text-secondary">Today, 9:00 AM</div>
                                            </div>
                                            <div className="text-sm font-bold text-green-500">+$4,500.00</div>
                                        </div>
                                        {/* Item 2 */}
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-elevated border border-white/5 hover:bg-white/5 transition-colors cursor-pointer group/item">
                                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 group-hover/item:scale-110 transition-transform">
                                                <Zap size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-white">Netflix Sub</div>
                                                <div className="text-xs text-text-secondary">Yesterday</div>
                                            </div>
                                            <div className="text-sm font-bold text-white">-$15.99</div>
                                        </div>
                                        {/* Item 3 */}
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-elevated border border-white/5 hover:bg-white/5 transition-colors cursor-pointer group/item">
                                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 group-hover/item:scale-110 transition-transform">
                                                <Smartphone size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-white">Apple Store</div>
                                                <div className="text-xs text-text-secondary">Nov 24</div>
                                            </div>
                                            <div className="text-sm font-bold text-white">-$299.00</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature Showcase 2: AI Advisor */}
                    <div className="flex flex-col lg:flex-row-reverse items-center gap-16 mb-32">
                        <div className="flex-1 space-y-8">
                            <div className="w-16 h-16 rounded-3xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                                <Sparkles size={32} />
                            </div>
                            <h2 className="text-4xl font-bold text-white">Your Personal AI Financial Architect</h2>
                            <p className="text-text-secondary text-lg leading-relaxed">
                                Meet your new financial genius. Our AI analyzes your spending patterns, investment risk, and goals to provide actionable, personalized advice 24/7.
                            </p>
                            <ul className="space-y-4">
                                <FeaturePoint text="Smart Budgeting Recommendations" />
                                <FeaturePoint text="Investment Opportunity Alerts" />
                                <FeaturePoint text="Natural Language Queries" />
                            </ul>
                        </div>
                        <div className="flex-1 relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-3xl opacity-20 group-hover:opacity-40 blur-xl transition duration-500" />
                            <div className="relative bg-[#121212] border border-white/10 rounded-3xl p-8 aspect-video flex items-center justify-center">
                                <div className="text-center space-y-4">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-white/10 text-text-secondary text-sm">
                                        <Sparkles size={14} className="text-yellow-500" />
                                        <span>"How can I save $500 more this month?"</span>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-surface-elevated border border-white/5 text-left max-w-md mx-auto">
                                        <p className="text-sm text-text-primary">
                                            <span className="text-yellow-500 font-bold">AI:</span> Based on your recent dining expenses, cutting back on weekend delivery could save you approx. $320. Additionally...
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature Grid */}
                    <div className="mb-32">
                        <h2 className="text-3xl font-bold text-white text-center mb-16">And so much more...</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <FeatureCard
                                icon={PieChart}
                                title="Portfolio Analytics"
                                description="Deep dive into your asset allocation, performance metrics, and historical trends."
                                color="text-green-500"
                                bgColor="bg-green-500/10"
                            />
                            <FeatureCard
                                icon={Target}
                                title="Goal Setting"
                                description="Set specific financial targets and track your progress with visual milestones."
                                color="text-red-500"
                                bgColor="bg-red-500/10"
                            />
                            <FeatureCard
                                icon={Wallet}
                                title="Expense Tracking"
                                description="Automatically categorize transactions and spot spending leaks before they drain your wallet."
                                color="text-purple-500"
                                bgColor="bg-purple-500/10"
                            />
                            <FeatureCard
                                icon={Shield}
                                title="Bank-Grade Security"
                                description="Your data is protected by 256-bit encryption and strict privacy protocols."
                                color="text-blue-500"
                                bgColor="bg-blue-500/10"
                            />
                            <FeatureCard
                                icon={Smartphone}
                                title="Mobile Access"
                                description="Manage your money on the go with our fully responsive mobile interface."
                                color="text-pink-500"
                                bgColor="bg-pink-500/10"
                            />
                            <FeatureCard
                                icon={TrendingUp}
                                title="Market Insights"
                                description="Stay ahead with curated market news and trends relevant to your portfolio."
                                color="text-orange-500"
                                bgColor="bg-orange-500/10"
                            />
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center bg-black from-surface to-surface-elevated border border-white/5 rounded-[3rem] p-12 relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.15),transparent_50%)]" />
                        <h2 className="text-4xl font-bold text-white mb-6 relative z-10">Ready to take control?</h2>
                        <p className="text-text-secondary text-lg mb-8 max-w-xl mx-auto relative z-10">
                            Join thousands of users who are building a better financial future with FinNuvora.
                        </p>
                        <Link href="/auth/login" className="px-10 py-4 rounded-full bg-primary text-background font-bold text-lg hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 relative z-10">
                            Start Your Journey
                        </Link>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}

function FeaturePoint({ text }) {
    return (
        <li className="flex items-center gap-3 text-text-primary font-medium">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <ArrowRight size={14} className="text-primary" />
            </div>
            <span>{text}</span>
        </li>
    );
}

function FeatureCard({ icon: Icon, title, description, color, bgColor }) {
    return (
        <div className="p-8 rounded-3xl bg-surface border border-white/5 hover:border-white/10 hover:bg-surface-elevated transition-all duration-300 group">
            <div className={`w-12 h-12 rounded-2xl ${bgColor} ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-text-secondary leading-relaxed">
                {description}
            </p>
        </div>
    );
}
