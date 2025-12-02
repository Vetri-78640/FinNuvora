'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCookie } from '@/lib/cookies';
import { useEffect, useState } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { Sun, Moon, Menu, X, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const router = useRouter();
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

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'userData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/');
  };

  return (
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
            <Link href="/features" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              Pricing
            </Link>
            <Link href="#about" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              About
            </Link>
          </div>

          <div className="w-px h-6 bg-border" />

          <div className="flex items-center gap-4">
            {/* <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button> */}

            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Button onClick={handleLogout} variant="secondary">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-text-primary p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-0 z-[60] bg-background/95 backdrop-blur-xl p-6 flex flex-col gap-6 animate-in slide-in-from-top-10 duration-200">
          <div className="flex justify-end">
            <button
              className="text-text-primary p-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-col gap-4 mt-4">
            <Link
              href="/features"
              className="text-2xl font-medium text-text-secondary hover:text-text-primary py-2 border-b border-white/5"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-2xl font-medium text-text-secondary hover:text-text-primary py-2 border-b border-white/5"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>
          </div>

          <div className="mt-auto flex flex-col gap-4 pb-8">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full justify-center py-4 text-lg">Dashboard</Button>
                </Link>
                <Button onClick={handleLogout} variant="secondary" className="w-full justify-center py-4 text-lg">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full justify-center py-4 text-lg">Sign in</Button>
                </Link>
                <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full justify-center py-4 text-lg">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
