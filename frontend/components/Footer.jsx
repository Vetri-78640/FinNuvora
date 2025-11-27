'use client';

import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-surface border-t border-border pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-center items-start gap-12 md:gap-32 mb-16">
                    {/* Brand & Description */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-2 group">
                            <img src="/logo.svg" alt="FinNuvora Logo" className="w-8 h-8 group-hover:scale-105 transition-transform duration-300" />
                            <span className="font-bold text-xl text-text-primary tracking-tight">FinNuvora</span>
                        </Link>
                        <p className="text-text-secondary leading-relaxed max-w-sm">
                            Empowering your financial journey with AI-driven insights and comprehensive portfolio management.
                        </p>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="font-bold text-text-primary mb-6">Product</h4>
                        <ul className="space-y-4">
                            <FooterLink href="/features">Features</FooterLink>
                            <FooterLink href="/pricing">Pricing</FooterLink>
                            <FooterLink href="/security">Security</FooterLink>
                            <FooterLink href="/roadmap">Roadmap</FooterLink>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-text-tertiary text-sm">
                        © {new Date().getFullYear()} FinNuvora. All rights reserved.
                    </p>
                    <div className="flex items-center gap-8">
                        <Link href="#privacy" className="text-sm text-text-tertiary hover:text-text-primary transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="#terms" className="text-sm text-text-tertiary hover:text-text-primary transition-colors">
                            Terms of Service
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                            <span className="text-sm text-text-tertiary">All systems operational</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ href, icon: Icon }) {
    return (
        <a
            href={href}
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary hover:bg-primary/5 transition-all duration-300"
        >
            <Icon size={18} />
        </a>
    );
}

function FooterLink({ href, children }) {
    return (
        <li>
            <Link
                href={href}
                className="text-text-secondary hover:text-primary hover:translate-x-1 transition-all duration-200 inline-block"
            >
                {children}
            </Link>
        </li>
    );
}
