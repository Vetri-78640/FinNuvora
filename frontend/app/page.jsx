'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCookie } from '@/lib/cookies';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';

const testimonials = [
  {
    name: 'Sanjay Narayan',
    title: 'Founder & Angel Investor',
    quote: 'FinNuvora eliminated ten spreadsheets from my workflow. The AI insights feel like having a private wealth strategist on-demand.',
  },
  {
    name: 'Claire Donovan',
    title: 'VP Finance, ScaleUp',
    quote: 'Our leadership team finally has a single dashboard for treasury, venture positions and liquidity runway. It is stunningly executed.',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-block px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-medium">
            Intelligent Wealth Orchestration
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight">
            Your complete financial<br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              intelligence platform
            </span>
          </h1>

          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Manage portfolios, track investments, automate goals, and get AI-powered insights. All in one beautiful, intuitive platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <button 
              onClick={handleCta}
              className="btn-primary"
            >
              {isAuthenticated ? 'Open Dashboard' : 'Create Free Account'}
            </button>
            <Link 
              href="#features"
              className="btn-secondary"
            >
              Learn More
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            {[
              { value: '$2.3B+', label: 'Assets Managed' },
              { value: '50K+', label: 'Active Users' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat) => (
              <div key={stat.label} className="card p-6">
                <div className="text-2xl font-bold text-blue-400">{stat.value}</div>
                <div className="text-slate-400 text-sm mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 border-t border-slate-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Powerful Features Built for You</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Everything you need to manage wealth intelligently, all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Portfolio Management',
                description: 'Track all your investments across stocks, crypto, real estate and more in real-time.',
              },
              {
                title: 'Goal Tracking',
                description: 'Set financial goals and watch FinNuvora help you stay on track with smart recommendations.',
              },
              {
                title: 'AI Insights',
                description: 'Get intelligent analysis of your portfolio with actionable recommendations powered by AI.',
              },
              {
                title: 'Transaction History',
                description: 'Complete record of all your transactions with powerful search and filter capabilities.',
              },
              {
                title: 'Smart Alerts',
                description: 'Receive notifications when your portfolio hits important milestones or trends.',
              },
              {
                title: 'Security First',
                description: 'Enterprise-grade security with bank-level encryption and multi-factor authentication.',
              },
            ].map((feature) => (
              <div key={feature.title} className="card p-8 hover:border-blue-500/50 transition-colors">
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose FinNuvora?</h2>
            <p className="text-slate-400 text-lg">The modern wealth management platform for everyone</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'All-in-One Dashboard',
                description: 'See your complete financial picture at a glance with real-time updates across all your accounts.',
              },
              {
                title: 'Intelligent Automation',
                description: 'Automate repetitive tasks and let AI handle the heavy lifting so you can focus on strategy.',
              },
              {
                title: 'Beautiful Design',
                description: 'An intuitive interface that makes complex financial data easy to understand and act upon.',
              },
              {
                title: 'Always Learning',
                description: 'Our AI continuously learns your patterns and preferences to provide better recommendations.',
              },
            ].map((benefit) => (
              <div key={benefit.title} className="card p-8 border-blue-500/30 bg-blue-500/5">
                <h3 className="text-2xl font-bold text-white mb-3">{benefit.title}</h3>
                <p className="text-slate-300">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Loved by Smart Investors</h2>
            <p className="text-slate-400 text-lg">See what our users have to say</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial) => (
              <blockquote key={testimonial.name} className="card p-8">
                <p className="text-lg text-white mb-6">"{testimonial.quote}"</p>
                <footer className="text-sm">
                  <strong className="text-blue-400">{testimonial.name}</strong>
                  <span className="text-slate-400"> · {testimonial.title}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 border-t border-slate-800/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Take Control of Your Wealth?</h2>
          <p className="text-slate-400 text-lg mb-8">
            Join thousands of smart investors using FinNuvora to manage their wealth intelligently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleCta}
              className="btn-primary"
            >
              {isAuthenticated ? 'Open Dashboard' : 'Get Started Free'}
            </button>
            <Link 
              href="/auth/login"
              className="btn-secondary"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
