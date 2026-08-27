'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faXmark,
  faCircleNotch,
  faShieldHalved,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import {
  isPushSupported,
  getNotificationPermissionState,
  subscribeToPushNotifications,
  isIOSorIPad,
  isStandalonePWA,
} from '@/src/utils/pushNotification';

export default function NotificationPermissionPrompt() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isiPadPrompt, setIsiPadPrompt] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkState = () => {
      const isIPadDevice = isIOSorIPad();
      const isStandalone = isStandalonePWA();
      const hasNotificationAPI = 'Notification' in window;

      // If on iPad in regular Safari tab (not yet installed to Home Screen)
      if (isIPadDevice && !isStandalone && !hasNotificationAPI) {
        const dismissed = sessionStorage.getItem('letters_notif_prompt_dismissed');
        if (!dismissed) {
          setIsiPadPrompt(true);
          const timer = setTimeout(() => setVisible(true), 800);
          return () => clearTimeout(timer);
        }
        return;
      }

      if (!isPushSupported()) return;

      const perm = getNotificationPermissionState();
      // If already granted, do NOT show popup
      if (perm === 'granted') {
        setVisible(false);
        return;
      }

      // If blocked or dismissed previously in this session
      const dismissed = sessionStorage.getItem('letters_notif_prompt_dismissed');
      if (dismissed || perm === 'denied') {
        setVisible(false);
        return;
      }

      // Small delay for smooth entrance after page load
      const timer = setTimeout(() => {
        setVisible(true);
      }, 800);

      return () => clearTimeout(timer);
    };

    checkState();
  }, []);

  const handleEnable = async () => {
    if (isiPadPrompt) {
      sessionStorage.setItem('letters_notif_prompt_dismissed', 'true');
      setVisible(false);
      return;
    }

    setLoading(true);
    try {
      const res = await subscribeToPushNotifications({ role: 'admin' });
      if (res && res.success) {
        setSuccess(true);
        setTimeout(() => {
          setVisible(false);
        }, 1200);
      }
    } catch (err) {
      console.warn('Permission request result:', err);
      if (getNotificationPermissionState() === 'denied') {
        setVisible(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('letters_notif_prompt_dismissed', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-full px-2 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-[var(--card)] border border-[var(--olive)] rounded-2xl p-4 shadow-2xl backdrop-blur-md relative overflow-hidden flex items-center gap-3.5">
        {/* Bell Icon */}
        <div className="w-10 h-10 rounded-xl bg-[var(--olive)] text-white flex items-center justify-center flex-shrink-0 shadow-md">
          <FontAwesomeIcon icon={faBell} className="text-base text-amber-300" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-6">
          <h3 className="text-xs font-bold text-[var(--text)]">
            {isiPadPrompt ? 'Add to Home Screen for Alerts' : 'Enable Order Notifications'}
          </h3>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-snug">
            {isiPadPrompt
              ? 'Tap Share (⬆) → "Add to Home Screen" to receive order alerts on iPad.'
              : 'Get instant sound and lockscreen alerts for new orders.'}
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={handleEnable}
              disabled={loading || success}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-xs cursor-pointer active:scale-95 ${
                success
                  ? 'bg-emerald-600'
                  : 'bg-[var(--olive)] hover:bg-[var(--olive-hover)]'
              }`}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faCircleNotch} className="text-[10px] animate-spin" />
                  <span>Enabling...</span>
                </>
              ) : success ? (
                <>
                  <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                  <span>Enabled</span>
                </>
              ) : isiPadPrompt ? (
                <>
                  <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                  <span>Got It</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faBell} className="text-[10px]" />
                  <span>Turn On</span>
                </>
              )}
            </button>

            <button
              onClick={handleDismiss}
              className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--card)] text-xs text-[var(--text-muted)] hover:text-[var(--text)] font-medium transition-colors cursor-pointer"
            >
              Later
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2.5 right-2.5 text-[var(--text-muted)] hover:text-[var(--text)] w-6 h-6 rounded-md flex items-center justify-center cursor-pointer transition-colors"
          title="Close"
        >
          <FontAwesomeIcon icon={faXmark} className="text-xs" />
        </button>
      </div>
    </div>
  );
}

