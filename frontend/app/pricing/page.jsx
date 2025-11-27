'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Check, X, Zap, Star, Shield, Plus } from 'lucide-react';
import { useState } from 'react';

export default function PricingPage() {
    const [annual, setAnnual] = useState(true);

    return (
        <div className="min-h-screen bg-[#000000] text-text-primary font-sans selection:bg-primary/20">
            <Navbar />

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16 space-y-6 animate-fade-in">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
                            Simple, Transparent Pricing
                        </h1>
                        <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
                            Start for free, upgrade as you grow. No hidden fees, no surprises.
                        </p>

                        {/* Toggle */}
                        <div className="flex items-center justify-center gap-4 mt-8">
                            <span className={`text-sm font-medium ${!annual ? 'text-white' : 'text-text-secondary'}`}>Monthly</span>
                            <button
                                onClick={() => setAnnual(!annual)}
                                className="w-14 h-8 rounded-full bg-surface-elevated border border-white/10 relative transition-colors hover:border-primary/50"
                            >
                                <div className={`absolute top-1 w-6 h-6 rounded-full bg-primary transition-all duration-300 ${annual ? 'left-7' : 'left-1'}`} />
                            </button>
                            <span className={`text-sm font-medium ${annual ? 'text-white' : 'text-text-secondary'}`}>
                                Yearly <span className="text-primary text-xs ml-1">(Save 20%)</span>
                            </span>
                        </div>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
                        {/* Free Tier */}
                        <PricingCard
                            title="Starter"
                            price="0"
                            description="Perfect for individuals just starting their financial journey."
                            features={[
                                "Manual Transaction Entry",
                                "Basic Expense Tracking",
                                "1 Portfolio",
                                "Monthly Reports",
                                "Community Support"
                            ]}
                            buttonText="Get Started"
                            buttonVariant="outline"
                        />

                        {/* Pro Tier */}
                        <PricingCard
                            title="Pro"
                            price={annual ? "12" : "15"}
                            description="Advanced tools for serious investors and budgeters."
                            features={[
                                "Unlimited Bank Connections",
                                "AI Financial Advisor",
                                "Unlimited Portfolios",
                                "Investment Analysis",
                                "Goal Forecasting",
                                "Priority Support"
                            ]}
                            buttonText="Start Free Trial"
                            buttonVariant="primary"
                            popular={true}
                        />

                        {/* Enterprise Tier */}
                        <PricingCard
                            title="Business"
                            price={annual ? "49" : "59"}
                            description="For financial advisors and small family offices."
                            features={[
                                "Multi-User Access",
                                "Client Management",
                                "White-label Reports",
                                "API Access",
                                "Dedicated Account Manager",
                                "Custom Integrations"
                            ]}
                            buttonText="Contact Sales"
                            buttonVariant="outline"
                        />
                    </div>

                    {/* FAQ Section */}
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
                        <div className="space-y-6">
                            <FAQItem
                                question="Can I switch plans later?"
                                answer="Yes, you can upgrade or downgrade your plan at any time. Changes will be applied to your next billing cycle."
                            />
                            <FAQItem
                                question="Is my data safe?"
                                answer="Absolutely. We use bank-grade 256-bit encryption and never sell your data to third parties. Check our Security page for more details."
                            />
                            <FAQItem
                                question="Do you offer student discounts?"
                                answer="Yes! Students with a valid .edu email address get 50% off the Pro plan. Contact support to apply."
                            />
                            <FAQItem
                                question="What payment methods do you accept?"
                                answer="We accept all major credit cards (Visa, Mastercard, Amex) and PayPal."
                            />
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

function PricingCard({ title, price, description, features, buttonText, buttonVariant, popular }) {
    return (
        <div className={`relative p-8 rounded-3xl border flex flex-col ${popular ? 'bg-surface-elevated border-primary/50 shadow-2xl shadow-primary/10 scale-105 z-10' : 'bg-surface border-white/5 hover:border-white/10'}`}>
            {popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-background text-sm font-bold shadow-lg">
                    Most Popular
                </div>
            )}

            <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-text-secondary text-sm h-10">{description}</p>
            </div>

            <div className="mb-8">
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">${price}</span>
                    <span className="text-text-secondary">/mo</span>
                </div>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-text-secondary">
                        <Check size={18} className={`shrink-0 ${popular ? 'text-primary' : 'text-white'}`} />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <button className={`w-full py-3 rounded-full font-bold transition-all ${buttonVariant === 'primary'
                ? 'bg-primary text-background hover:bg-primary-hover shadow-lg shadow-primary/20'
                : 'bg-transparent border border-white/20 text-white hover:bg-white/5'
                }`}>
                {buttonText}
            </button>
        </div>
    );
}

function FAQItem({ question, answer }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-white/5 pb-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full text-left group"
            >
                <span className="text-lg font-medium text-white group-hover:text-primary transition-colors">{question}</span>
                <span className={`text-text-secondary transition-transform duration-300 flex items-center justify-center ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
                    <Plus size={20} />
                </span>
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <p className="text-text-secondary leading-relaxed">
                        {answer}
                    </p>
                </div>
            </div>
        </div>
    );
}
