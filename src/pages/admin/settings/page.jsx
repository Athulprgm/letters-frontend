'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLock,
  faEnvelope,
  faKey,
  faShieldHalved,
  faCircleCheck,
  faCircleExclamation,
  faEye,
  faEyeSlash,
  faUserShield,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '@/src/store/authStore';
import { useSettingsStore } from '@/src/store/settingsStore';
import { useProductStore } from '@/src/store/productStore';
import { adminLoading } from '@/src/store/adminLoadingStore';
import { apiUrl } from '@/src/config/api';
import { faTag, faToggleOn, faToggleOff, faBell } from '@fortawesome/free-solid-svg-icons';
import NotificationToggle from '@/src/components/NotificationToggle';

export default function AdminSettingsPage() {
  const { adminUser, initAuth } = useAuthStore();
  const { settings, updateSettings } = useSettingsStore();
  const { setAllProductsShowPrice } = useProductStore();

  const [priceSettingsSaved, setPriceSettingsSaved] = useState(false);
  const [bulkActionMsg, setBulkActionMsg] = useState('');

  // Email form state
  const [emailForm, setEmailForm] = useState({
    currentEmail: '',
    newEmail: '',
    currentPassword: '',
  });
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailError, setEmailError] = useState('');

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (adminUser?.email) {
      setEmailForm((prev) => ({
        ...prev,
        currentEmail: adminUser.email,
        newEmail: adminUser.email,
      }));
    }
  }, [adminUser]);

  // Handle Email Update
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');

    if (!emailForm.newEmail.trim() || !emailForm.newEmail.includes('@')) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    if (!emailForm.currentPassword) {
      setEmailError('Please enter your current password to authorize email change.');
      return;
    }

    setEmailLoading(true);
    adminLoading.start('Updating Admin Email...', 'Synchronizing account authentication credentials...');
    try {
      const res = await fetch(apiUrl('/api/auth/change-credentials'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: emailForm.currentPassword,
          newEmail: emailForm.newEmail.trim(),
        }),
      });
      const data = await res.json();

      if (data.success) {
        setEmailSuccess('Admin email address updated successfully!');
        setEmailForm((prev) => ({
          ...prev,
          currentEmail: emailForm.newEmail.trim(),
          currentPassword: '',
        }));
        await initAuth();
        adminLoading.stop('Admin email updated successfully!', 800);
        setTimeout(() => setEmailSuccess(''), 4000);
      } else {
        setEmailError(data.message || 'Failed to update email.');
        adminLoading.error(data.message || 'Failed to update email.');
      }
    } catch (err) {
      setEmailError('Server connection error. Please try again.');
      adminLoading.error('Server connection error. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordForm.currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation password do not match.');
      return;
    }

    setPasswordLoading(true);
    adminLoading.start('Securing New Password...', 'Encrypting and updating admin portal password...');
    try {
      const res = await fetch(apiUrl('/api/auth/change-credentials'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setPasswordSuccess('Admin password updated successfully! Please remember your new password.');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        adminLoading.stop('Password updated successfully!', 800);
        setTimeout(() => setPasswordSuccess(''), 4500);
      } else {
        setPasswordError(data.message || 'Failed to update password.');
        adminLoading.error(data.message || 'Failed to update password.');
      }
    } catch (err) {
      setPasswordError('Server connection error. Please try again.');
      adminLoading.error('Server connection error. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div className="pb-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">
          Account &amp; Security Settings
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Manage your administrator portal login credentials, contact email, and password.
        </p>
      </div>

      {/* Current Admin Session Info Pill */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--olive)]/10 text-[var(--olive)] flex items-center justify-center text-sm flex-shrink-0">
            <FontAwesomeIcon icon={faUserShield} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-xs text-[var(--text)]">Admin Portal Account</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.2 rounded-full">
                Active
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Username: <span className="font-semibold text-[var(--text)]">admin</span> • Email: <span className="font-semibold text-[var(--text)]">{adminUser?.email || emailForm.currentEmail || 'admin@letters.com'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-medium">
          <FontAwesomeIcon icon={faShieldHalved} className="text-[var(--olive)] text-xs" />
          <span>Protected Session</span>
        </div>
      </div>

      {/* Storefront Pricing & Catalog Visibility Control */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3.5 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center text-sm">
              <FontAwesomeIcon icon={faTag} />
            </div>
            <div>
              <h2 className="font-bold text-sm text-[var(--text)]">Storefront Price Visibility (Public Control)</h2>
              <p className="text-[11px] text-[var(--text-muted)]">
                Control whether numerical prices (₹) are displayed publicly across all pages or converted to inquiry mode.
              </p>
            </div>
          </div>

          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
            settings.showPricesGlobally === true
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
          }`}>
            {settings.showPricesGlobally === true ? 'Prices Visible on Public' : 'Catalog / Price on Request Mode'}
          </span>
        </div>

        {priceSettingsSaved && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <FontAwesomeIcon icon={faCircleCheck} className="text-sm flex-shrink-0" />
            <span>Storefront price settings updated successfully! Changes apply immediately across all pages.</span>
          </div>
        )}

        {bulkActionMsg && (
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs flex items-center gap-2 animate-fadeIn">
            <FontAwesomeIcon icon={faCircleCheck} className="text-sm flex-shrink-0" />
            <span>{bulkActionMsg}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Main Global Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] gap-4">
            <div>
              <p className="font-bold text-xs text-[var(--text)]">
                Master Switch: Display Prices on Public Store
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5 max-w-xl">
                When switched <strong>OFF</strong>, all product prices, strikethrough MRPs, and price filters are hidden on all customer pages and replaced with elegant <em>&quot;Price on Request&quot;</em> inquiry badges.
              </p>
            </div>

            <button
              type="button"
              onClick={async () => {
                const nextVal = !(settings.showPricesGlobally === true);
                await updateSettings({ showPricesGlobally: nextVal });
                setPriceSettingsSaved(true);
                setTimeout(() => setPriceSettingsSaved(false), 3500);
              }}
              className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.showPricesGlobally === true ? 'bg-emerald-600' : 'bg-stone-400 dark:bg-stone-600'
              }`}
              role="switch"
              aria-checked={settings.showPricesGlobally === true}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  settings.showPricesGlobally === true ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Inquiry Label & WhatsApp Customization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">
                Storefront Inquiry Badge Text
              </label>
              <input
                type="text"
                value={settings.priceInquiryLabel || 'Price on Request'}
                onChange={(e) => updateSettings({ priceInquiryLabel: e.target.value })}
                placeholder="e.g. Price on Request / Custom Quote"
                className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
              />
              <p className="text-[10px] text-[var(--text-muted)] mt-1">
                Badge text shown when prices are hidden (e.g. &quot;Price on Request&quot;).
              </p>
            </div>

            <div>
              <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">
                Quick Actions (Product Database)
              </label>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setAllProductsShowPrice(false);
                    setBulkActionMsg('All product records updated to "Price on Request".');
                    setTimeout(() => setBulkActionMsg(''), 4000);
                  }}
                  className="px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  Hide All Product Prices
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAllProductsShowPrice(true);
                    setBulkActionMsg('All product records set to "Price Shown".');
                    setTimeout(() => setBulkActionMsg(''), 4000);
                  }}
                  className="px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  Show All Product Prices
                </button>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">
                Bulk set all individual product item records in database.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form 1: Change Admin Email */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-[var(--border)] pb-3.5">
          <div className="w-7 h-7 rounded-md bg-[var(--olive)]/10 text-[var(--olive)] flex items-center justify-center text-xs">
            <FontAwesomeIcon icon={faEnvelope} />
          </div>
          <div>
            <h2 className="font-bold text-sm text-[var(--text)]">Change Admin Email</h2>
            <p className="text-[11px] text-[var(--text-muted)]">
              Update the primary administrator email address for store notifications and portal login.
            </p>
          </div>
        </div>

        {emailSuccess && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <FontAwesomeIcon icon={faCircleCheck} className="text-sm flex-shrink-0" />
            <span>{emailSuccess}</span>
          </div>
        )}

        {emailError && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
            <FontAwesomeIcon icon={faCircleExclamation} className="text-sm flex-shrink-0" />
            <span>{emailError}</span>
          </div>
        )}

        <form onSubmit={handleUpdateEmail} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">
                Current Email Address
              </label>
              <input
                type="email"
                disabled
                value={emailForm.currentEmail || 'admin@letters.com'}
                className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)]/80 border border-[var(--border)] text-xs text-[var(--text-muted)] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">
                New Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="newadmin@letters.com"
                value={emailForm.newEmail}
                onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">
              Current Password (Authorization Required) *
            </label>
            <input
              type="password"
              required
              placeholder="Enter your current password"
              value={emailForm.currentPassword}
              onChange={(e) => setEmailForm({ ...emailForm, currentPassword: e.target.value })}
              className="w-full sm:w-1/2 px-3.5 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
            />
          </div>

          <div className="flex justify-end pt-2 border-t border-[var(--border)]">
            <button
              type="submit"
              disabled={emailLoading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[var(--olive)] text-white text-xs font-bold hover:bg-[var(--olive-hover)] shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faCheck} className="text-xs" />
              <span>{emailLoading ? 'Updating Email...' : 'Save New Email'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Form 2: Change Admin Password */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-[var(--border)] pb-3.5">
          <div className="w-7 h-7 rounded-md bg-[var(--olive)]/10 text-[var(--olive)] flex items-center justify-center text-xs">
            <FontAwesomeIcon icon={faKey} />
          </div>
          <div>
            <h2 className="font-bold text-sm text-[var(--text)]">Change Admin Password</h2>
            <p className="text-[11px] text-[var(--text-muted)]">
              Update your security password for accessing the LETTERS store management portal.
            </p>
          </div>
        </div>

        {passwordSuccess && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <FontAwesomeIcon icon={faCircleCheck} className="text-sm flex-shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
            <FontAwesomeIcon icon={faCircleExclamation} className="text-sm flex-shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">
              Current Password *
            </label>
            <div className="relative w-full sm:w-2/3">
              <input
                type={showCurrentPass ? 'text' : 'password'}
                required
                placeholder="Enter current password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full pl-3.5 pr-10 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] text-xs cursor-pointer"
                title={showCurrentPass ? 'Hide password' : 'Show password'}
              >
                <FontAwesomeIcon icon={showCurrentPass ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full pl-3.5 pr-10 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] text-xs cursor-pointer"
                  title={showNewPass ? 'Hide password' : 'Show password'}
                >
                  <FontAwesomeIcon icon={showNewPass ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-[var(--text)] uppercase text-[10px] mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  placeholder="Re-enter new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full pl-3.5 pr-10 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--olive)]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] text-xs cursor-pointer"
                  title={showConfirmPass ? 'Hide password' : 'Show password'}
                >
                  <FontAwesomeIcon icon={showConfirmPass ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[var(--bg)]/70 border border-[var(--border)] text-[11px] text-[var(--text-muted)] space-y-1">
            <p className="font-bold text-[var(--text)] flex items-center gap-1.5">
              <FontAwesomeIcon icon={faLock} className="text-[10px] text-[var(--olive)]" />
              <span>Password Guidelines:</span>
            </p>
            <p>• Use a minimum of 6 alphanumeric characters.</p>
            <p>• Keep your password secure and do not share it with unauthorized personnel.</p>
          </div>

          <div className="flex justify-end pt-2 border-t border-[var(--border)]">
            <button
              type="submit"
              disabled={passwordLoading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[var(--olive)] text-white text-xs font-bold hover:bg-[var(--olive-hover)] shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faKey} className="text-xs" />
              <span>{passwordLoading ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Section 4: Web Push Notification Settings */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--olive)]/10 text-[var(--olive)] flex items-center justify-center">
              <FontAwesomeIcon icon={faBell} className="text-sm" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--text)]">Admin Browser Push Notifications</h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Receive instant real-time alerts when customers place new product orders on the store.
              </p>
            </div>
          </div>
          <NotificationToggle role="admin" />
        </div>

        <div className="p-3 rounded-lg bg-[var(--bg)]/70 border border-[var(--border)] text-[11px] text-[var(--text-muted)] space-y-1.5">
          <p className="font-bold text-[var(--text)]">Push Notification Features:</p>
          <p>• <strong>Instant Order Alerts:</strong> Browser notifications popup immediately upon successful order creation with customer name, order ID, and amount.</p>
          <p>• <strong>Deep Link Navigation:</strong> Clicking incoming notifications automatically opens and focuses the Admin Orders management screen.</p>
          <p>• <strong>Standard VAPID Architecture:</strong> Built without external dependencies using native browser Web Push and Service Worker APIs.</p>
        </div>
      </div>

    </div>
  );
}
