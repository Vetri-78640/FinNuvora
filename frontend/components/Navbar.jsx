'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getCookie } from '@/lib/cookies';
import { useEffect, useState } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { Menu, X, ArrowRight, ChevronRight } from 'lucide-react';

const navLinks = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/roadmap', label: 'Roadmap' },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsAuthenticated(Boolean(getCookie('authToken')));

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'userData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setIsMobileMenuOpen(false);
    router.push('/');
  };

  return (
    <>
      {/* Fixed Navbar Bar */}
      <nav
        className={`fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 transition-all duration-300 rounded-full border border-white/10 shadow-2xl shadow-black/50 backdrop-blur-xl ${scrolled
          ? 'bg-black/30 py-2'
          : 'bg-white/5 py-4'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.svg" alt="FinNuvora Logo" className="w-10 h-10 group-hover:scale-105 transition-transform duration-300" />
            <span className="font-bold text-xl text-text-primary tracking-tight">FinNuvora</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${pathname === link.href
                    ? 'text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="w-px h-6 bg-border" />

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <button className="px-5 py-2.5 rounded-full text-sm font-semibold text-text-primary hover:bg-white/5 transition-colors">
                      Dashboard
                    </button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-5 py-2.5 rounded-full text-sm font-semibold border border-white/10 text-text-secondary hover:text-text-primary hover:border-white/20 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <button className="px-5 py-2.5 rounded-full text-sm font-semibold text-text-primary hover:bg-white/5 transition-colors">
                      Sign in
                    </button>
                  </Link>
                  <Link href="/auth/register">
                    <button className="px-5 py-2.5 rounded-full text-sm font-semibold bg-primary text-background hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
                      Get Started
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-text-primary p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* ===== Mobile Menu — rendered OUTSIDE of nav so it can truly cover the full screen ===== */}
      <div
        className={`fixed inset-0 z-[100] md:hidden transition-all duration-300 ${isMobileMenuOpen
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
          }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={`absolute inset-x-0 top-0 bg-[#0a0a0a] border-b border-white/10 shadow-2xl transition-transform duration-300 ease-out ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
            }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
            <Link
              href="/"
              className="flex items-center gap-3"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <img src="/logo.svg" alt="FinNuvora Logo" className="w-8 h-8" />
              <span className="font-bold text-lg text-white tracking-tight">FinNuvora</span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav Links */}
          <div className="px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-4 rounded-2xl text-base font-medium transition-colors ${pathname === link.href
                  ? 'text-primary bg-primary/5'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
              >
                <span>{link.label}</span>
                <ChevronRight size={16} className="text-gray-600" />
              </Link>
            ))}
          </div>

          {/* Separator */}
          <div className="mx-6 border-t border-white/5" />

          {/* Action Buttons */}
          <div className="px-6 py-5 space-y-3">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-primary text-background font-bold text-sm hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
                >
                  Dashboard
                  <ArrowRight size={16} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full py-3.5 rounded-2xl border border-white/10 text-gray-300 font-semibold text-sm hover:bg-white/5 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-primary text-background font-bold text-sm hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
                >
                  Get Started
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full py-3.5 rounded-2xl border border-white/10 text-gray-300 font-semibold text-sm hover:bg-white/5 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
