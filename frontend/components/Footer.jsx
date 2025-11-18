'use client';

import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-slate-900/50 border-t border-slate-800/30">
        <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Footer Grid - Centered */}
            <div className="flex justify-center mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                {/* Product Links */}
                <div className="text-center">
                <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-4">Product</h4>
                <ul className="space-y-3">
                    <li>
                    <Link 
                        href="#features" 
                        className="text-slate-400 hover:text-slate-200 transition-colors text-xs"
                    >
                        Features
                    </Link>
                    </li>
                    <li>
                    <Link 
                        href="#pricing" 
                        className="text-slate-400 hover:text-slate-200 transition-colors text-xs"
                    >
                        Pricing
                    </Link>
                    </li>
                    <li>
                    <Link 
                        href="#security" 
                        className="text-slate-400 hover:text-slate-200 transition-colors text-xs"
                    >
                        Security
                    </Link>
                    </li>
                </ul>
                </div>

                {/* Legal Links */}
                <div className="text-center">
                <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-4">Legal</h4>
                <ul className="space-y-3">
                    <li>
                    <Link 
                        href="#privacy" 
                        className="text-slate-400 hover:text-slate-200 transition-colors text-xs"
                    >
                        Privacy Policy
                    </Link>
                    </li>
                    <li>
                    <Link 
                        href="#terms" 
                        className="text-slate-400 hover:text-slate-200 transition-colors text-xs"
                    >
                        Terms of Service
                    </Link>
                    </li>
                </ul>
                </div>

                {/* Status/Info Column */}
                <div className="text-center">
                <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-4">Status</h4>
                <ul className="space-y-3">
                    <li>
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-slate-400 text-xs">All systems operational</span>
                    </div>
                    </li>
                    <li>
                    <a 
                        href="#contact" 
                        className="text-slate-400 hover:text-slate-200 transition-colors text-xs"
                    >
                        Contact Support
                    </a>
                    </li>
                </ul>
                </div>
            </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-800/30 pt-8 text-center">
            <p className="text-slate-500 text-xs">
                © 2025 FinNuvora. All rights reserved.
            </p>
            </div>
        </div>
        </footer>
    );
}
