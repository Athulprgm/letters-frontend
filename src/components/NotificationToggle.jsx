import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faBellSlash, faCheck, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import {
  isPushSupported,
  getNotificationPermissionState,
  getExistingPushSubscription,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from '@/src/utils/pushNotification';

export default function NotificationToggle({
  role = 'admin',
  userId = null,
  variant = 'button',
  className = '',
}) {
  const [supported, setSupported] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const checkStatus = async () => {
      const isSupp = isPushSupported();
      setSupported(isSupp);
      if (!isSupp) return;

      const perm = getNotificationPermissionState();
      if (perm === 'granted') {
        const sub = await getExistingPushSubscription();
        setIsSubscribed(Boolean(sub));
      } else {
        setIsSubscribed(false);
      }
    };

    checkStatus();
  }, []);

  const handleToggle = async () => {
    if (!supported) {
      setFeedback({ type: 'error', message: 'Browser does not support Web Push' });
      setTimeout(() => setFeedback(null), 3500);
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      if (isSubscribed) {
        await unsubscribeFromPushNotifications();
        setIsSubscribed(false);
        setFeedback({ type: 'info', message: 'Notifications disabled' });
      } else {
        await subscribeToPushNotifications({ role, userId });
        setIsSubscribed(true);
        setFeedback({ type: 'success', message: 'Notifications enabled! You will receive order alerts.' });
      }
    } catch (err) {
      console.error('Notification subscription failed:', err);
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to update notification settings.',
      });
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  if (!supported) {
    return null;
  }

  if (variant === 'icon-button') {
    return (
      <div className="relative inline-flex items-center">
        <button
          type="button"
          onClick={handleToggle}
          disabled={loading}
          className={`p-2 rounded-lg border border-[var(--border)] transition-all cursor-pointer flex items-center justify-center ${
            isSubscribed
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-xs'
              : 'bg-[var(--card)] hover:bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)]'
          } ${className}`}
          title={isSubscribed ? 'Notifications Active (Click to disable)' : 'Enable Browser Push Notifications'}
          aria-label="Toggle Push Notifications"
        >
          {loading ? (
            <FontAwesomeIcon icon={faCircleNotch} className="text-xs animate-spin" />
          ) : (
            <FontAwesomeIcon icon={isSubscribed ? faBell : faBellSlash} className="text-xs" />
          )}
        </button>

        {feedback && (
          <div
            className={`absolute top-full mt-2 right-0 z-50 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg border animate-in fade-in slide-in-from-top-1 duration-200 ${
              feedback.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : feedback.type === 'error'
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-[var(--card)] text-[var(--text)] border-[var(--border)]'
            }`}
          >
            {feedback.message}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-flex flex-col items-start">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
          isSubscribed
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
            : 'bg-[var(--card)] hover:bg-[var(--bg)] text-[var(--text)] border-[var(--border)]'
        } ${className}`}
      >
        {loading ? (
          <FontAwesomeIcon icon={faCircleNotch} className="text-xs animate-spin text-[var(--olive)]" />
        ) : isSubscribed ? (
          <FontAwesomeIcon icon={faCheck} className="text-xs text-emerald-600" />
        ) : (
          <FontAwesomeIcon icon={faBell} className="text-xs text-[var(--olive)]" />
        )}
        <span>{isSubscribed ? 'Notifications Active' : 'Enable Notifications'}</span>
      </button>

      {feedback && (
        <div
          className={`mt-1.5 px-3 py-1 rounded-md text-[11px] font-medium border shadow-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200'
              : feedback.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/70 dark:text-rose-200'
              : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)]'
          }`}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
}
