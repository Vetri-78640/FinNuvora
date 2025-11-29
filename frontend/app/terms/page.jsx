'use client';

import { Scale, FileCheck, AlertCircle, ShieldCheck, Gavel, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfService() {
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
                    <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-elevated border border-white/10 text-xs font-medium text-primary mb-6">
                        <Scale size={14} />
                        <span>Last Updated: November 2025</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                        Terms of Service
                    </h1>
                    <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
                        Please read these terms carefully before using FinNuvora. By accessing or using our service, you agree to be bound by these terms.
                    </p>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 pb-32">
                <div className="space-y-12">

                    {/* Section 1 */}
                    <section className="bg-surface p-8 rounded-3xl border border-white/5 hover:border-primary/20 transition-colors duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center mb-6 text-primary">
                            <FileCheck size={24} />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                        <div className="space-y-4 text-text-secondary leading-relaxed">
                            <p>
                                By accessing or using the FinNuvora application, website, and services (collectively, the "Service"), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the Service.
                            </p>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="bg-surface p-8 rounded-3xl border border-white/5 hover:border-primary/20 transition-colors duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center mb-6 text-purple-400">
                            <ShieldCheck size={24} />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">2. User Accounts</h2>
                        <div className="space-y-4 text-text-secondary leading-relaxed">
                            <p>
                                To access certain features of the Service, you must register for an account. You agree to:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 marker:text-purple-400">
                                <li>Provide accurate, current, and complete information during registration.</li>
                                <li>Maintain and promptly update your account information.</li>
                                <li>Maintain the security of your password and accept all risks of unauthorized access to your account.</li>
                                <li>Notify us immediately if you discover or suspect any security breaches.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className="bg-surface p-8 rounded-3xl border border-white/5 hover:border-primary/20 transition-colors duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center mb-6 text-red-400">
                            <AlertCircle size={24} />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">3. Prohibited Conduct</h2>
                        <div className="space-y-4 text-text-secondary leading-relaxed">
                            <p>
                                You agree not to violate any applicable law, contract, intellectual property, or other third-party right. You are solely responsible for your conduct while using the Service. You will not:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 marker:text-red-400">
                                <li>Use the Service for any illegal or unauthorized purpose.</li>
                                <li>Attempt to bypass or circumvent any security measures.</li>
                                <li>Interfere with or disrupt the integrity or performance of the Service.</li>
                                <li>Use any robot, spider, crawler, or other automated means to access the Service.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section className="bg-surface p-8 rounded-3xl border border-white/5 hover:border-primary/20 transition-colors duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center mb-6 text-blue-400">
                            <Gavel size={24} />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">4. Limitation of Liability</h2>
                        <div className="space-y-4 text-text-secondary leading-relaxed">
                            <p>
                                To the fullest extent permitted by applicable law, FinNuvora shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
                            </p>
                        </div>
                    </section>

                    {/* Contact */}
                    <div className="text-center pt-12 border-t border-white/5">
                        <p className="text-text-secondary mb-4">Questions about our terms?</p>
                        <a href="mailto:legal@finnuvora.com" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors">
                            Contact Legal Team <ArrowRight size={16} />
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
