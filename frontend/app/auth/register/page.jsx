'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { setCookie } from '@/lib/cookies';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { data } = await authAPI.register(email, password, name);
      setCookie('authToken', data.token, 7);
      setCookie('userData', JSON.stringify(data.user), 7);
      setSuccess('Account created successfully! Redirecting to dashboard...');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Registration failed. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500 rounded-3xl mx-auto mb-6 shadow-2xl shadow-blue-500/30">
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Create Account</h1>
          <p className="text-slate-400">Join FinNuvora today</p>
        </div>

        <div className="card-primary">
          {error && (
            <div className="mb-6 p-4 rounded-2xl border border-red-900/50 bg-red-950/30 text-red-300 text-sm">
              <div className="flex items-start gap-3 justify-between">
                <div className="flex-1">
                  <p className="font-semibold">Registration Failed</p>
                  <p className="mt-1 text-red-200">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setError('')}
                  className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0 ml-3 font-bold text-lg"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-2xl border border-green-900/50 bg-green-950/30 text-green-300 text-sm">
              <p className="font-semibold">Success</p>
              <p className="mt-1 text-green-200">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="input-field w-full"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="input-field w-full"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field w-full pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors text-sm"
                  disabled={loading}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1.5">At least 6 characters</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field w-full pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors text-sm"
                  disabled={loading}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary font-semibold mt-8 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-700/50 pt-8">
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
