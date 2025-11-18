'use client';

import { useEffect, useState } from 'react';
import { userAPI, preferencesAPI } from '@/lib/api';
import { useProtectedRoute } from '@/lib/hooks/useProtectedRoute';

const defaultProfileForm = {
  name: '',
  email: '',
};

const defaultPasswordForm = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const defaultPreferencesForm = {
  theme: 'dark',
  notifications: {
    priceAlert: true,
    portfolioUpdate: true,
  },
  currency: 'USD',
  language: 'en',
};

export default function ProfilePage() {
  useProtectedRoute();

  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(defaultProfileForm);
  const [passwordForm, setPasswordForm] = useState(defaultPasswordForm);
  const [preferences, setPreferences] = useState(defaultPreferencesForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const [profileRes, preferencesRes] = await Promise.all([
          userAPI.getProfile(),
          preferencesAPI.getPreferences(),
        ]);

        setProfile(profileRes.data.user);
        setProfileForm({
          name: profileRes.data.user.name,
          email: profileRes.data.user.email,
        });
        if (preferencesRes.data.preferences) {
          setPreferences({
            theme: preferencesRes.data.preferences.theme ?? 'dark',
            notifications: {
              priceAlert:
                preferencesRes.data.preferences.notifications?.priceAlert ?? true,
              portfolioUpdate:
                preferencesRes.data.preferences.notifications?.portfolioUpdate ??
                true,
            },
            currency: preferencesRes.data.preferences.currency ?? 'USD',
            language: preferencesRes.data.preferences.language ?? 'en',
          });
        }
      } catch (err) {
        setError(
          err.response?.data?.error ||
            'Failed to load profile information. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    try {
      setSavingProfile(true);
      setError('');
      setSuccess('');
      const { data } = await userAPI.updateProfile(profileForm);
      setProfile(data.user);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New password and confirmation do not match');
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
      setSuccess('Password updated successfully');
      setPasswordForm(defaultPasswordForm);
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

  const handleResetPreferences = async () => {
    const confirmed = window.confirm(
      'Reset preferences to defaults? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      setSavingPreferences(true);
      setError('');
      setSuccess('');
      const { data } = await preferencesAPI.resetPreferences();
      setPreferences({
        theme: data.preferences.theme,
        notifications: data.preferences.notifications,
        currency: data.preferences.currency,
        language: data.preferences.language,
      });
      setSuccess('Preferences reset to defaults');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset preferences');
    } finally {
      setSavingPreferences(false);
    }
  };

  if (loading) {
    return (
      <div className="card text-center py-12">
        <p className="text-slate-400 text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Profile &amp; Preferences
        </h2>
        <p className="text-slate-400 mt-2">
          Manage your personal information, password, and app preferences.
        </p>
      </div>

      {(error || success) && (
        <div
          className={`rounded-xl border px-4 py-3 ${
            error
              ? 'border-red-500/40 bg-red-500/10 text-red-300'
              : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
          }`}
        >
          {error || success}
        </div>
      )}

      <div className="card space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-white">Profile details</h3>
          <p className="text-slate-400 text-sm mt-1">
            Joined{' '}
            {profile
              ? new Date(profile.createdAt).toLocaleDateString()
              : '—'}
          </p>
        </div>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 text-sm font-medium mb-2 block">
                Full name
              </label>
              <input
                className="input-field"
                value={profileForm.name}
                onChange={(event) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm font-medium mb-2 block">
                Email address
              </label>
              <input
                className="input-field"
                type="email"
                value={profileForm.email}
                onChange={(event) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={savingProfile}>
            {savingProfile ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      </div>

      <div className="card space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-white">Change password</h3>
          <p className="text-slate-400 text-sm mt-1">
            Use a strong password that you don&apos;t reuse elsewhere.
          </p>
        </div>
        <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-slate-300 text-sm font-medium mb-2 block">
              Current password
            </label>
            <input
              type="password"
              className="input-field"
              value={passwordForm.oldPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  oldPassword: event.target.value,
                }))
              }
              required
            />
          </div>
          <div>
            <label className="text-slate-300 text-sm font-medium mb-2 block">
              New password
            </label>
            <input
              type="password"
              className="input-field"
              value={passwordForm.newPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  newPassword: event.target.value,
                }))
              }
              required
            />
          </div>
          <div>
            <label className="text-slate-300 text-sm font-medium mb-2 block">
              Confirm new password
            </label>
            <input
              type="password"
              className="input-field"
              value={passwordForm.confirmPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  confirmPassword: event.target.value,
                }))
              }
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary md:col-span-3"
            disabled={changingPassword}
          >
            {changingPassword ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>

      <div className="card space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-white">App preferences</h3>
            <p className="text-slate-400 text-sm mt-1">
              Tailor FinNuvora to match your experience.
            </p>
          </div>
          <button
            className="btn-ghost px-4 py-3"
            onClick={handleResetPreferences}
            disabled={savingPreferences}
          >
            Reset to defaults
          </button>
        </div>
        <form onSubmit={handleSavePreferences} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-slate-300 text-sm font-medium mb-2 block">
              Theme
            </label>
            <select
              className="input-field"
              value={preferences.theme}
              onChange={(event) =>
                setPreferences((prev) => ({
                  ...prev,
                  theme: event.target.value,
                }))
              }
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
          <div>
            <label className="text-slate-300 text-sm font-medium mb-2 block">
              Currency
            </label>
            <input
              className="input-field"
              value={preferences.currency}
              onChange={(event) =>
                setPreferences((prev) => ({
                  ...prev,
                  currency: event.target.value,
                }))
              }
            />
          </div>
          <div>
            <label className="text-slate-300 text-sm font-medium mb-2 block">
              Language
            </label>
            <select
              className="input-field"
              value={preferences.language}
              onChange={(event) =>
                setPreferences((prev) => ({
                  ...prev,
                  language: event.target.value,
                }))
              }
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
          <div className="flex flex-col gap-3 border border-slate-800/60 rounded-xl p-4 bg-slate-900/40">
            <span className="text-slate-300 text-sm font-medium">
              Notifications
            </span>
            <label className="flex items-center justify-between text-slate-200">
              <span>Price alerts</span>
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={preferences.notifications.priceAlert}
                onChange={(event) =>
                  setPreferences((prev) => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      priceAlert: event.target.checked,
                    },
                  }))
                }
              />
            </label>
            <label className="flex items-center justify-between text-slate-200">
              <span>Portfolio updates</span>
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={preferences.notifications.portfolioUpdate}
                onChange={(event) =>
                  setPreferences((prev) => ({
                    ...prev,
                    notifications: {
                      ...prev.notifications,
                      portfolioUpdate: event.target.checked,
                    },
                  }))
                }
              />
            </label>
          </div>
          <button
            type="submit"
            className="btn-primary md:col-span-2"
            disabled={savingPreferences}
          >
            {savingPreferences ? 'Saving...' : 'Save preferences'}
          </button>
        </form>
      </div>
    </div>
  );
}
