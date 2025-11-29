'use client';

import { Shield, Lock, Eye, FileText, Server, Globe } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#000000] text-text-primary">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img src="/logo.svg" alt="FinNuvora Logo" className="w-8 h-8 group-hover:scale-105 transition-transform duration-300" />
                        <span className="font-bold text-xl tracking-tight">FinNuvora</span>
                    </Link>
                    <Link href="/" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">
                        Back to Home
                    </Link>
                </div>
            </nav>

            {/* Header */}
            <header className="pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-elevated border border-white/10 text-xs font-medium text-primary mb-6">
                        <Shield size={14} />
                        <span>Last Updated: November 2025</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                        Privacy Policy
                    </h1>
                    <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
                        Your privacy is our priority. We are committed to protecting your personal data and ensuring transparency in how we handle your financial information.
                    </p>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 pb-32">
                <div className="space-y-12">

                    {/* Section 1 */}
                    <section className="bg-surface p-8 rounded-3xl border border-white/5 hover:border-primary/20 transition-colors duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center mb-6 text-primary">
                            <Eye size={24} />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
                        <div className="space-y-4 text-text-secondary leading-relaxed">
                            <p>
                                We collect information that you provide directly to us, including:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 marker:text-primary">
                                <li>Personal identification information (Name, email address, phone number)</li>
                                <li>Financial data (Transaction history, account balances, portfolio details)</li>
                                <li>Authentication credentials (Passwords, security tokens)</li>
                                <li>Profile preferences and settings</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="bg-surface p-8 rounded-3xl border border-white/5 hover:border-primary/20 transition-colors duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center mb-6 text-blue-400">
                            <Server size={24} />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">2. How We Use Your Data</h2>
                        <div className="space-y-4 text-text-secondary leading-relaxed">
                            <p>
                                Your data is used exclusively to provide and improve our services:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 marker:text-blue-400">
                                <li>To provide personalized financial insights and analytics</li>
                                <li>To process and categorize your transactions automatically</li>
                                <li>To maintain the security of your account and prevent fraud</li>
                                <li>To communicate with you about updates, security alerts, and support</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className="bg-surface p-8 rounded-3xl border border-white/5 hover:border-primary/20 transition-colors duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center mb-6 text-green-400">
                            <Lock size={24} />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">3. Data Security</h2>
                        <div className="space-y-4 text-text-secondary leading-relaxed">
                            <p>
                                We implement state-of-the-art security measures to protect your data:
                            </p>
                            <p>
                                All sensitive data is encrypted at rest and in transit using industry-standard AES-256 encryption. We utilize secure socket layer (SSL) technology for all data transmission. Our databases are protected by multi-layer firewalls and strict access controls.
                            </p>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section className="bg-surface p-8 rounded-3xl border border-white/5 hover:border-primary/20 transition-colors duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center mb-6 text-purple-400">
                            <Globe size={24} />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">4. Third-Party Sharing</h2>
                        <div className="space-y-4 text-text-secondary leading-relaxed">
                            <p>
                                We do not sell your personal data. We may share data with trusted third-party service providers only when necessary for:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 marker:text-purple-400">
                                <li>Cloud hosting and infrastructure (e.g., AWS, Vercel)</li>
                                <li>Financial data aggregation services (e.g., Plaid)</li>
                                <li>Analytics providers to improve user experience</li>
                            </ul>
                        </div>
                    </section>

                    {/* Contact */}
                    <div className="text-center pt-12 border-t border-white/5">
                        <p className="text-text-secondary mb-4">Have questions about our privacy practices?</p>
                        <a href="mailto:privacy@finnuvora.com" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors">
                            <FileText size={18} />
                            Contact Privacy Team
                        </a>
                    </div>

                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 bg-surface">
                <div className="max-w-7xl mx-auto px-6 text-center text-text-tertiary text-sm">
                    <p>© {new Date().getFullYear()} FinNuvora. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
