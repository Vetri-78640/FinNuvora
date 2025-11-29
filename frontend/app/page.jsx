'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCookie } from '@/lib/cookies';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';
import { ArrowRight, Shield, Zap, PieChart, TrendingUp, Lock, Star, Check, Cpu } from 'lucide-react';

const testimonials = [
  {
    name: 'Warren Buffett',
    title: 'Chairperson of Berkshire Hathaway',
    quote: 'FinNuvora\'s AI insights have completely changed how I view my portfolio. It\'s like having a personal analyst.',
  },
  {
    name: 'Claire Donovan',
    title: 'CEO of Berkshire Hathaway',
    quote: 'The interface is stunning and the goal tracking features are exactly what I needed to stay disciplined.',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(Boolean(getCookie('authToken')));
  }, []);

  const handleCta = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/auth/register');
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col font-sans text-text-primary">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Now in Early Access
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-tight animate-slide-in">
            Master your wealth with<br />
            <span className="text-primary">intelligent insights</span>
          </h1>

          <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed animate-slide-in" style={{ animationDelay: '0.1s' }}>
            The next-generation financial platform that combines powerful portfolio tracking with AI-driven recommendations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-slide-in" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={handleCta}
              className="px-8 py-4 bg-primary text-background rounded-full font-bold text-lg hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 flex items-center gap-2 justify-center"
            >
              {isAuthenticated ? 'Open Dashboard' : 'Get Started Free'}
              <ArrowRight size={20} />
            </button>
            <Link
              href="pricing"
              className="px-8 py-4 bg-surface border border-border rounded-full font-bold text-lg text-text-primary hover:bg-surface-elevated transition-all flex items-center gap-2 justify-center"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlight 1 */}
      <section className="py-24 px-6 relative">
        <div className="absolute top-1/2 left-0 w-[80vw] h-[80vw] max-w-[500px] max-h-[500px] bg-blue-500/10 rounded-full blur-[100px] -z-10" />
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <PieChart size={24} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">See everything in one place</h2>
            <p className="text-text-secondary text-lg leading-relaxed">
              Connect all your bank accounts, credit cards, and investment portfolios. FinNuvora aggregates your data to give you a complete, real-time picture of your net worth.
            </p>
            <ul className="space-y-3">
              <CheckItem text="Automatic Bank Sync" />
              <CheckItem text="Investment Account Sync" />
              <CheckItem text="Real Estate & Manual Assets" />
            </ul>
          </div>
          <div className="flex-1 w-full">
            {/* Grid Mock UI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-[#121212] border border-white/10 rounded-3xl shadow-2xl group hover:border-blue-500/30 transition-colors">

              {/* Total Net Worth (Full Width) */}
              <div className="col-span-1 sm:col-span-2 bg-surface-elevated rounded-2xl p-5 border border-white/5 flex justify-between items-center">
                <div>
                  <div className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-1">Account Balance</div>
                  <div className="text-3xl font-bold text-white">$142,893</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                  <TrendingUp size={20} />
                </div>
              </div>

              {/* Monthly Income */}
              <div className="bg-surface-elevated rounded-2xl p-5 border border-white/5">
                <div className="text-text-secondary text-xs font-medium mb-2">Income</div>
                <div className="text-xl font-bold text-white">$12,450</div>
                <div className="text-xs text-green-500 mt-1">+8% vs last mo</div>
              </div>

              {/* Monthly Expenses */}
              <div className="bg-surface-elevated rounded-2xl p-5 border border-white/5">
                <div className="text-text-secondary text-xs font-medium mb-2">Expenses</div>
                <div className="text-xl font-bold text-white">$4,200</div>
                <div className="text-xs text-text-secondary mt-1">On track</div>
              </div>

              {/* Top Asset (Full Width) */}
              <div className="col-span-1 sm:col-span-2 bg-surface-elevated rounded-2xl p-5 border border-white/5 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                  <Cpu size={20} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-white">Nvidia Corp.</div>
                  <div className="text-xs text-text-secondary">100 Shares</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">$18,250.00</div>
                  <div className="text-xs text-green-500">+10.4%</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlight 2 */}
      <section className="py-24 px-6 relative">
        <div className="absolute top-1/2 right-0 w-[80vw] h-[80vw] max-w-[500px] max-h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10" />
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row-reverse items-center gap-16">
          <div className="flex-1 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Zap size={24} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">AI that works for you</h2>
            <p className="text-text-secondary text-lg leading-relaxed">
              Stop guessing with your money. Our advanced AI analyzes your spending habits and market trends to provide actionable advice that helps you grow your wealth.
            </p>
            <ul className="space-y-3">
              <CheckItem text="Smart Budget Alerts" />
              <CheckItem text="Investment Opportunities" />
              <CheckItem text="Tax Optimization Tips" />
            </ul>
          </div>
          <div className="flex-1">
            {/* Detailed Mock UI: AI Insights Stack */}
            <div className="relative h-[400px] w-full flex items-center justify-center">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />

              {/* Card 2 (Back) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[90%] bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 opacity-40 scale-90 blur-[1px]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <TrendingUp size={16} className="text-blue-500" />
                  </div>
                  <div className="h-2 w-24 bg-white/10 rounded-full" />
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full mb-2" />
                <div className="h-2 w-2/3 bg-white/10 rounded-full" />
              </div>

              {/* Card 1 (Middle) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-[95%] bg-[#1e1e1e] border border-white/10 rounded-2xl p-6 opacity-70 scale-95 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <ArrowRight size={20} className="text-red-500 rotate-[-45deg]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Spending Alert</div>
                    <div className="text-xs text-text-secondary">Dining Out</div>
                  </div>
                </div>
                <p className="text-sm text-text-secondary">You've exceeded your dining budget by <span className="text-white font-bold">$120</span> this month.</p>
              </div>

              {/* Main Card (Front) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full bg-[#121212] border border-white/10 rounded-3xl p-8 shadow-2xl z-10 hover:-translate-y-[52%] transition-transform duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                    <Zap size={12} />
                    <span>AI Recommendation</span>
                  </div>
                  <span className="text-xs text-text-secondary">Just now</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">Optimize Subscriptions</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-6">
                  We found 3 unused subscriptions costing you <span className="text-white font-bold">$45/mo</span>. Canceling them could boost your savings rate by 12%.
                </p>

                <div className="flex gap-3">
                  <button className="flex-1 py-3 bg-primary text-background rounded-xl font-bold text-sm hover:bg-primary-hover transition-colors">
                    Review List
                  </button>
                  <button className="px-4 py-3 bg-white/5 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-colors">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-surface/30 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Loved by Finance Experts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="p-8 rounded-3xl bg-surface border border-white/5 hover:border-primary/20 transition-colors">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} className="fill-primary text-primary" />)}
                </div>
                <p className="text-lg text-text-primary mb-6 leading-relaxed">"{t.quote}"</p>
                <div>
                  <div className="font-bold text-white">{t.name}</div>
                  <div className="text-sm text-text-secondary">{t.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-tight">Start your financial revolution.</h2>
          <p className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto">
            Join thousands of users who have already taken control of their financial future with FinNuvora.
          </p>
          <button
            onClick={handleCta}
            className="px-10 py-5 bg-primary text-background rounded-full font-bold text-xl hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 hover:scale-105"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started for Free'}
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function StatItem({ value, label }) {
  return (
    <div className="space-y-2">
      <div className="text-3xl md:text-4xl font-bold text-white">{value}</div>
      <div className="text-sm text-text-secondary uppercase tracking-wider">{label}</div>
    </div>
  );
}

function CheckItem({ text }) {
  return (
    <li className="flex items-center gap-3 text-text-primary">
      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
        <Check size={14} className="text-green-500" />
      </div>
      <span>{text}</span>
    </li>
  );
}
