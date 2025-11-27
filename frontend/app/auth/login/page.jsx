'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { setCookie } from '@/lib/cookies';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      const { data } = await authAPI.login(email, password);
      setCookie('authToken', data.token, 7);
      setCookie('userData', JSON.stringify(data.user), 7);
      setSuccess('Login successful! Redirecting...');

      // Redirect after a delay to let user see success message
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome Back</h1>
        <p className="text-text-secondary">Sign in to continue your financial journey</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-error/20 bg-error/10 text-error text-sm flex items-start gap-3 animate-slide-in">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Login Failed</p>
            <p className="mt-1 opacity-90">{error}</p>
          </div>
          <button onClick={() => setError('')} className="hover:opacity-70">×</button>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-xl border border-success/20 bg-success/10 text-success text-sm flex items-start gap-3 animate-slide-in">
          <CheckCircle size={18} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Success</p>
            <p className="mt-1 opacity-90">{success}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-full text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text-primary">Password</label>
            <Link href="/auth/forgot-password" className="text-xs font-medium text-primary hover:text-primary-hover transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-11 pr-11 py-3 bg-surface border border-border rounded-full text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
              disabled={loading}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          isLoading={loading}
          className="w-full py-3 text-base"
        >
          Sign In
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-text-secondary text-sm">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-primary font-semibold hover:text-primary-hover transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
