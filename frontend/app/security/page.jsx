'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, Lock, Server, Eye, FileKey, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SecurityPage() {
    return (
        <div className="min-h-screen bg-[#000000] text-text-primary font-sans selection:bg-primary/20">
            <Navbar />

            <main className="pt-24 md:pt-32 pb-20 px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-20 space-y-6 animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium mb-4">
                            <Shield size={16} className="fill-success/20" />
                            <span>Bank-Grade Security</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
                            Your Security is Our Priority
                        </h1>
                        <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
                            We use state-of-the-art encryption and security protocols to ensure your financial data remains safe, private, and accessible only to you.
                        </p>
                    </div>

                    {/* Core Security Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                        <SecurityCard
                            icon={Lock}
                            title="256-bit Encryption"
                            description="Your data is encrypted at rest and in transit using AES-256 encryption, the same standard used by major banks."
                            color="text-blue-500"
                            bgColor="bg-blue-500/10"
                        />
                        <SecurityCard
                            icon={Server}
                            title="Secure Infrastructure"
                            description="Hosted on AWS with multi-layer firewalls, regular security audits, and 24/7 automated threat monitoring."
                            color="text-purple-500"
                            bgColor="bg-purple-500/10"
                        />
                        <SecurityCard
                            icon={Eye}
                            title="Privacy First"
                            description="We never sell your data. Your financial information is yours alone, and we strictly adhere to GDPR and CCPA."
                            color="text-green-500"
                            bgColor="bg-green-500/10"
                        />
                    </div>

                    {/* Detailed Sections */}
                    <div className="space-y-24">
                        {/* Section 1 */}
                        <div className="flex flex-col md:flex-row items-center gap-12">
                            <div className="flex-1 space-y-6">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                                    <FileKey size={24} />
                                </div>
                                <h2 className="text-3xl font-bold text-white">Multi-Factor Authentication</h2>
                                <p className="text-text-secondary leading-relaxed">
                                    Add an extra layer of protection to your account with MFA. We support authenticator apps and SMS verification to ensure that you are the only one who can access your account, even if your password is compromised.
                                </p>
                                <ul className="space-y-3 pt-4">
                                    <FeatureItem text="Biometric Login Support" />
                                    <FeatureItem text="Device Management" />
                                    <FeatureItem text="Suspicious Activity Alerts" />
                                </ul>
                            </div>
                            <div className="flex-1 bg-surface border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative z-10 space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-surface-elevated border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                                <CheckCircle2 size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">Login Attempt</div>
                                                <div className="text-xs text-text-secondary">San Francisco, CA • Just now</div>
                                            </div>
                                        </div>
                                        <span className="text-green-500 text-sm font-bold">Verified</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-surface-elevated border border-white/5 opacity-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                                                <AlertCircle size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">Failed Attempt</div>
                                                <div className="text-xs text-text-secondary">Unknown Location • 2 mins ago</div>
                                            </div>
                                        </div>
                                        <span className="text-red-500 text-sm font-bold">Blocked</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                            <div className="flex-1 space-y-6">
                                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                                    <Shield size={24} />
                                </div>
                                <h2 className="text-3xl font-bold text-white">Compliance & Standards</h2>
                                <p className="text-text-secondary leading-relaxed">
                                    We adhere to the strictest financial industry standards. Our platform is regularly audited by third-party security firms to identify and patch potential vulnerabilities before they can be exploited.
                                </p>
                                <ul className="space-y-3 pt-4">
                                    <FeatureItem text="SOC 2 Type II Compliant" />
                                    <FeatureItem text="PCI DSS Level 1 Certified" />
                                    <FeatureItem text="Regular Penetration Testing" />
                                </ul>
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-4">
                                <ComplianceBadge label="SOC 2" sub="Type II" />
                                <ComplianceBadge label="GDPR" sub="Compliant" />
                                <ComplianceBadge label="256-bit" sub="AES Encryption" />
                                <ComplianceBadge label="PCI DSS" sub="Level 1" />
                            </div>
                        </div>
                    </div>

                    {/* CTA */}

                </div>
            </main>

            <Footer />
        </div>
    );
}

function SecurityCard({ icon: Icon, title, description, color, bgColor }) {
    return (
        <div className="p-8 rounded-3xl bg-surface border border-white/5 hover:border-white/10 transition-all duration-300 group">
            <div className={`w-14 h-14 rounded-2xl ${bgColor} ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-text-secondary leading-relaxed">
                {description}
            </p>
        </div>
    );
}

function FeatureItem({ text }) {
    return (
        <li className="flex items-center gap-3 text-text-secondary">
            <CheckCircle2 size={18} className="text-primary shrink-0" />
            <span>{text}</span>
        </li>
    );
}

function ComplianceBadge({ label, sub }) {
    return (
        <div className="aspect-square rounded-2xl bg-surface border border-white/5 flex flex-col items-center justify-center p-4 hover:border-primary/30 transition-colors cursor-default">
            <span className="text-2xl font-bold text-white mb-1">{label}</span>
            <span className="text-xs text-text-tertiary uppercase tracking-wider">{sub}</span>
        </div>
    );
}
