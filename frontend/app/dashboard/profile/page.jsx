'use client';

import { useEffect, useState, useRef } from 'react';
import { userAPI, preferencesAPI } from '@/lib/api';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { User, Lock, Settings, Bell, Wallet, Check, ChevronDown } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useCurrency } from '@/lib/contexts/CurrencyContext';

export default function ProfilePage() {
  useProtectedRoute();
  const { setTheme } = useTheme();

  const { currency, updateCurrency, convertAmount, convertToUSD } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [baseBalanceUSD, setBaseBalanceUSD] = useState(0);
  const [baseLimitUSD, setBaseLimitUSD] = useState(600);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    accountBalance: '',
    monthlyLimit: '',
    profilePicture: null,
  });
  // Custom dropdown state
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    currency: currency || 'USD',
    language: 'en',
    notifications: {
      priceAlert: false,
      portfolioUpdate: false,
    },
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [availableCurrencies] = useState([
    'USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD',
    'CNY', 'CHF', 'SGD', 'NZD', 'HKD', 'KRW', 'BRL', 'ZAR', 'RUB', 'MXN'
  ]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCurrencyOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize profile picture from localStorage if available
  useEffect(() => {
    const savedPic = localStorage.getItem('profilePicture');
    if (savedPic) {
      setProfileForm(prev => ({ ...prev, profilePicture: savedPic }));
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getProfile();
        const user = response.data.user;

        // Check local storage for profile picture first
        const localPic = localStorage.getItem('profilePicture');

        // Store base USD values
        setBaseBalanceUSD(Number(user.accountBalance || 0));
        setBaseLimitUSD(Number(user.monthlyLimit || 600));

        setProfileForm({
          name: user.name || '',
          email: user.email || '',
          accountBalance: '', // Will be updated by the currency effect
          monthlyLimit: '', // Will be updated by the currency effect
          profilePicture: localPic || user.profilePicture || null,
        });

        const prefs = await preferencesAPI.getPreferences();
        setPreferences({
          theme: prefs.theme || 'dark',
          currency: currency || prefs.currency || 'USD', // Prefer context currency to avoid reversion
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

  // Update displayed balance when currency or base balance changes
  useEffect(() => {
    if (baseBalanceUSD !== undefined) {
      const convertedBalance = convertAmount(baseBalanceUSD);
      const convertedLimit = convertAmount(baseLimitUSD);

      setProfileForm(prev => ({
        ...prev,
        accountBalance: convertedBalance.toFixed(2),
        monthlyLimit: convertedLimit.toFixed(2)
      }));
    }
  }, [currency, baseBalanceUSD, baseLimitUSD]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        localStorage.setItem('profilePicture', base64String);
        window.dispatchEvent(new Event('profilePictureUpdated'));

        setProfileForm(prev => ({
          ...prev,
          profilePicture: base64String
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setError('');
      setSuccess('');

      // Convert displayed values back to USD for storage
      const balanceInUSD = convertToUSD(Number(profileForm.accountBalance));
      const limitInUSD = convertToUSD(Number(profileForm.monthlyLimit));

      // Send as JSON
      const payload = {
        name: profileForm.name,
        email: profileForm.email,
        accountBalance: balanceInUSD,
        monthlyLimit: limitInUSD
      };

      await userAPI.updateProfile(payload);

      // Update base values so it doesn't jump
      setBaseBalanceUSD(balanceInUSD);
      setBaseLimitUSD(limitInUSD);

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
        theme: 'dark',
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
      {/* ... (keep header and alerts) */}

      {/* ... (keep error/success) */}

      <div className="grid gap-8 md:grid-cols-2">
        {/* Personal Information */}
        <div className="bg-[#000000] p-6 rounded-3xl">
          <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
            <User size={20} className="text-primary" />
            Personal Information
          </h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">

            {/* ... (keep profile picture upload) */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full bg-surface-elevated border-2 border-primary/20 overflow-hidden mb-3 relative group">
                {profileForm.profilePicture ? (
                  <img
                    src={profileForm.profilePicture.startsWith('data:') || profileForm.profilePicture.startsWith('blob:') ? profileForm.profilePicture : `${process.env.NEXT_PUBLIC_API_URL.replace('/api', '')}${profileForm.profilePicture}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-secondary">
                    <User size={32} />
                  </div>
                )}
                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <span className="text-white text-xs font-bold">Change</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
              <p className="text-xs text-text-secondary">Click to upload new picture</p>
            </div>
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
            <div className="grid grid-cols-2 gap-4">
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
                <p className="text-xs text-text-secondary mt-1">Initial balance.</p>
              </div>
              <div>
                <label className="text-text-secondary text-xs font-medium mb-1.5 block">Monthly Limit</label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                  <input
                    type="number"
                    value={profileForm.monthlyLimit}
                    onChange={(e) => setProfileForm({ ...profileForm, monthlyLimit: e.target.value })}
                    className="input-field w-full pl-10"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-text-secondary mt-1">Spending cap.</p>
              </div>
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
              <label className="text-text-secondary text-xs font-medium mb-1.5 block">Currency</label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                  className="w-full flex items-center justify-between bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white hover:border-primary transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-white font-medium">{preferences.currency}</span>
                  </span>
                  <ChevronDown size={16} className={`transition-transform text-text-secondary ${isCurrencyOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCurrencyOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-[#1C1C1E] border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                    {availableCurrencies.map((curr) => (
                      <button
                        key={curr}
                        type="button"
                        onClick={() => {
                          setPreferences({ ...preferences, currency: curr });
                          setIsCurrencyOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                      >
                        <span className="text-white text-sm">{curr}</span>
                        {preferences.currency === curr && <Check size={16} className="text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-text-secondary text-xs font-medium mb-4 block flex items-center gap-2">
                <Bell size={16} /> Notifications
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-2xl border border-white/5 bg-surface hover:border-primary/50 transition-all">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={preferences.notifications.priceAlert}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        notifications: { ...preferences.notifications, priceAlert: e.target.checked }
                      })}
                      className="peer appearance-none w-6 h-6 rounded-lg border border-white/20 bg-black/50 checked:bg-primary checked:border-primary transition-all cursor-pointer"
                    />
                    <Check size={14} className="absolute text-black opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" strokeWidth={3} />
                  </div>
                  <span className="text-text-secondary group-hover:text-text-primary transition-colors font-medium">Price Alerts</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-2xl border border-white/5 bg-surface hover:border-primary/50 transition-all">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={preferences.notifications.portfolioUpdate}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        notifications: { ...preferences.notifications, portfolioUpdate: e.target.checked }
                      })}
                      className="peer appearance-none w-6 h-6 rounded-lg border border-white/20 bg-black/50 checked:bg-primary checked:border-primary transition-all cursor-pointer"
                    />
                    <Check size={14} className="absolute text-black opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" strokeWidth={3} />
                  </div>
                  <span className="text-text-secondary group-hover:text-text-primary transition-colors font-medium">Portfolio Updates</span>
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
