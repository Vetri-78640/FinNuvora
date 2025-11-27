'use client';

import { useEffect, useState } from 'react';
import { userAPI, preferencesAPI } from '@/lib/api';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { User, Lock, Settings, Bell, Wallet } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useCurrency } from '@/lib/contexts/CurrencyContext';

export default function ProfilePage() {
  useProtectedRoute();
  const { setTheme } = useTheme();

  const { currency, updateCurrency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    accountBalance: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [preferences, setPreferences] = useState({
    theme: 'system',
    currency: 'USD',
    language: 'en',
    notifications: {
      priceAlert: false,
      portfolioUpdate: false,
    },
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [availableCurrencies] = useState(['USD', 'EUR', 'GBP', 'JPY', 'INR']);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const user = await userAPI.getProfile();
        setProfileForm({
          name: user.name || '',
          email: user.email || '',
          accountBalance: user.accountBalance || '',
        });

        const prefs = await preferencesAPI.getPreferences();
        setPreferences({
          theme: prefs.theme || 'system',
          currency: prefs.currency || 'USD',
          language: prefs.language || 'en',
          notifications: {
            priceAlert: prefs.notifications?.priceAlert || false,
            portfolioUpdate: prefs.notifications?.portfolioUpdate || false,
          }
        });
      } catch (err) {
        console.error(err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setError('');
      setSuccess('');
      await userAPI.updateProfile(profileForm);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    try {
      setChangingPassword(true);
      setError('');
      setSuccess('');
      await userAPI.changePassword(
        passwordForm.oldPassword,
        passwordForm.newPassword
      );
      setSuccess('Password changed successfully');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSavePreferences = async (event) => {
    event.preventDefault();
    try {
      setSavingPreferences(true);
      setError('');
      setSuccess('');

      // Update currency via context
      if (preferences.currency !== currency) {
        await updateCurrency(preferences.currency);
      }

      // Update theme context
      setTheme(preferences.theme);

      const payload = {
        theme: preferences.theme,
        currency: preferences.currency,
        language: preferences.language,
        notifications: {
          priceAlert: Boolean(preferences.notifications.priceAlert),
          portfolioUpdate: Boolean(preferences.notifications.portfolioUpdate),
        },
      };
      await preferencesAPI.updatePreferences(payload);
      setSuccess('Preferences saved successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update preferences');
    } finally {
      setSavingPreferences(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Profile Settings</h1>
        <p className="text-text-secondary">Manage your account settings and preferences.</p>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error p-4 rounded-full">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-success/10 border border-success/20 text-success p-4 rounded-full">
          {success}
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {/* Personal Information */}
        <div className="bg-[#000000] p-6 rounded-3xl">
          <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
            <User size={20} className="text-primary" />
            Personal Information
          </h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="text-text-secondary text-xs font-medium mb-1.5 block">Full Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="input-field w-full"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="text-text-secondary text-xs font-medium mb-1.5 block">Email Address</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="input-field w-full"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="text-text-secondary text-xs font-medium mb-1.5 block">Account Balance</label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                <input
                  type="number"
                  value={profileForm.accountBalance}
                  onChange={(e) => setProfileForm({ ...profileForm, accountBalance: e.target.value })}
                  className="input-field w-full pl-10"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-text-secondary mt-1">Initial balance for your account.</p>
            </div>
            <Button
              type="submit"
              isLoading={savingProfile}
              disabled={savingProfile}
              className="w-full"
            >
              Save Changes
            </Button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-[#000000] p-6 rounded-3xl">
          <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
            <Lock size={20} className="text-primary" />
            Change Password
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="text-text-secondary text-xs font-medium mb-1.5 block">Current Password</label>
              <input
                type="password"
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="text-text-secondary text-xs font-medium mb-1.5 block">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="text-text-secondary text-xs font-medium mb-1.5 block">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="input-field w-full"
              />
            </div>
            <Button
              type="submit"
              variant="secondary"
              isLoading={changingPassword}
              disabled={changingPassword}
              className="w-full"
            >
              Update Password
            </Button>
          </form>
        </div>

        {/* App Preferences */}
        <div className="bg-[#000000] p-6 rounded-3xl md:col-span-2">
          <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
            <Settings size={20} className="text-primary" />
            App Preferences
          </h2>
          <form onSubmit={handleSavePreferences} className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-text-secondary text-xs font-medium mb-1.5 block">Theme</label>
              <select
                value={preferences.theme}
                onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                className="input-field w-full"
              >
                <option value="dark">Dark Mode</option>
                <option value="light">Light Mode</option>
                <option value="system">System Default</option>
              </select>
            </div>
            <div>
              <label className="text-text-secondary text-xs font-medium mb-1.5 block">Currency</label>
              <select
                value={preferences.currency}
                onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                className="input-field w-full"
              >
                {availableCurrencies.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-text-secondary text-xs font-medium mb-4 block flex items-center gap-2">
                <Bell size={16} /> Notifications
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-full border border-border hover:border-primary/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.priceAlert}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      notifications: { ...preferences.notifications, priceAlert: e.target.checked }
                    })}
                    className="w-5 h-5 rounded border-border bg-surface-elevated text-primary focus:ring-primary focus:ring-offset-surface"
                  />
                  <span className="text-text-secondary group-hover:text-text-primary transition-colors">Price Alerts</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-full border border-border hover:border-primary/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.portfolioUpdate}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      notifications: { ...preferences.notifications, portfolioUpdate: e.target.checked }
                    })}
                    className="w-5 h-5 rounded border-border bg-surface-elevated text-primary focus:ring-primary focus:ring-offset-surface"
                  />
                  <span className="text-text-secondary group-hover:text-text-primary transition-colors">Portfolio Updates</span>
                </label>
              </div>
            </div>
            <div className="md:col-span-2">
              <Button
                type="submit"
                isLoading={savingPreferences}
                disabled={savingPreferences}
                className="w-full"
              >
                Save Preferences
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
