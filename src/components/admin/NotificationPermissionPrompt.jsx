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
} from '@/src/utils/pushNotification';

export default function NotificationPermissionPrompt() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if push is supported and permission is not yet granted
    const checkState = () => {
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
      }, 1200);

      return () => clearTimeout(timer);
    };

    checkState();
  }, []);

  const handleEnable = async () => {
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
      // If user denied or closed the native prompt, hide modal
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
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[92%] sm:w-full px-2 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-[var(--card)] border-2 border-[var(--olive)] rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Glowing Bell Icon */}
        <div className="w-12 h-12 rounded-2xl bg-[var(--olive)] text-white flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse">
          <FontAwesomeIcon icon={faBell} className="text-xl text-amber-300" />
        </div>

        {/* Text Details */}
        <div className="flex-1 min-w-0 pr-6 sm:pr-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[var(--olive)]/15 text-[var(--olive)] px-2 py-0.5 rounded-full">
              Instant Order Alerts
            </span>
            <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
              <FontAwesomeIcon icon={faShieldHalved} className="text-[8px]" />
              Official Store Push
            </span>
          </div>

          <h3 className="text-sm font-bold text-[var(--text)] mt-1">
            Enable Order Notifications
          </h3>
          <p className="text-[11.5px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
            Get instant alerts &amp; sound chimes on your phone &amp; laptop whenever a new customer order is placed.
          </p>

          {/* Action Buttons */}
          <div className="mt-3.5 flex items-center gap-2.5">
            <button
              onClick={handleEnable}
              disabled={loading || success}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer active:scale-95 ${
                success
                  ? 'bg-emerald-600'
                  : 'bg-[var(--olive)] hover:bg-[var(--olive-hover)]'
              }`}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faCircleNotch} className="text-xs animate-spin" />
                  <span>Requesting Permission...</span>
                </>
              ) : success ? (
                <>
                  <FontAwesomeIcon icon={faCheck} className="text-xs" />
                  <span>Notifications Enabled!</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faBell} className="text-xs" />
                  <span>Turn On Notifications</span>
                </>
              )}
            </button>

            <button
              onClick={handleDismiss}
              className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--card)] text-xs text-[var(--text-muted)] hover:text-[var(--text)] font-semibold transition-colors cursor-pointer"
            >
              Later
            </button>
          </div>
        </div>

        {/* Top-Right Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-[var(--text-muted)] hover:text-[var(--text)] w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
          title="Dismiss"
        >
          <FontAwesomeIcon icon={faXmark} className="text-xs" />
        </button>
      </div>
    </div>
  );
}
