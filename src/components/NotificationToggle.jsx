import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faBellSlash,
  faCheck,
  faCircleNotch,
  faPaperPlane,
  faTriangleExclamation,
  faVolumeHigh,
} from '@fortawesome/free-solid-svg-icons';
import {
  isPushSupported,
  getNotificationPermissionState,
  getExistingPushSubscription,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  sendTestPushNotification,
  playNotificationSound,
} from '@/src/utils/pushNotification';

export default function NotificationToggle({
  role = 'admin',
  userId = null,
  variant = 'button',
  showTestButton = false,
  className = '',
}) {
  const [supported, setSupported] = useState(true);
  const [permissionState, setPermissionState] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const checkStatus = useCallback(async () => {
    const isSupp = isPushSupported();
    setSupported(isSupp);
    if (!isSupp) return;

    const perm = getNotificationPermissionState();
    setPermissionState(perm);

    if (perm === 'granted') {
      const sub = await getExistingPushSubscription();
      setIsSubscribed(Boolean(sub));
    } else {
      setIsSubscribed(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleToggle = async () => {
    if (!supported) {
      setFeedback({ type: 'error', message: 'Browser does not support Web Push' });
      setTimeout(() => setFeedback(null), 4000);
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      if (isSubscribed) {
        await unsubscribeFromPushNotifications();
        setIsSubscribed(false);
        setPermissionState(getNotificationPermissionState());
        setFeedback({ type: 'info', message: 'Push notifications paused' });
      } else {
        await subscribeToPushNotifications({ role, userId });
        setIsSubscribed(true);
        setPermissionState('granted');
        setFeedback({
          type: 'success',
          message: 'Notifications enabled! Real-time alerts are now active.',
        });
      }
    } catch (err) {
      console.error('Notification subscription error:', err);
      const perm = getNotificationPermissionState();
      setPermissionState(perm);
      setFeedback({
        type: 'error',
        message:
          perm === 'denied'
            ? 'Notifications blocked by browser. Please enable permissions in your address bar.'
            : err.message || 'Failed to update notification settings.',
      });
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleTestNotification = async () => {
    setTestLoading(true);
    setFeedback(null);
    try {
      // If not subscribed, try subscribing first or send direct test
      if (!isSubscribed && permissionState !== 'denied') {
        try {
          await subscribeToPushNotifications({ role, userId });
          setIsSubscribed(true);
          setPermissionState('granted');
        } catch (e) {}
      }

      await sendTestPushNotification({ role, userId });
      setFeedback({
        type: 'success',
        message: '🔔 Test alert sent with audio chime!',
      });
    } catch (err) {
      console.error('Test notification failed:', err);
      playNotificationSound();
      setFeedback({
        type: 'info',
        message: 'Played local audio chime (Push delivery: ' + (err.message || 'check network') + ')',
      });
    } finally {
      setTestLoading(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  if (!supported) {
    return null;
  }

  // Icon Button (for headers and compact bars)
  if (variant === 'icon-button') {
    return (
      <div className="relative inline-flex items-center gap-1">
        <button
          type="button"
          onClick={handleToggle}
          disabled={loading}
          className={`w-8 h-8 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
            isSubscribed
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-xs'
              : permissionState === 'denied'
              ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
              : 'bg-[var(--card)] hover:bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)] border-[var(--border)]'
          } ${className}`}
          title={
            isSubscribed
              ? 'Order Push Notifications: Active (Click to disable)'
              : permissionState === 'denied'
              ? 'Notifications blocked in browser settings'
              : 'Enable Instant Order Push Notifications'
          }
          aria-label="Toggle Push Notifications"
        >
          {loading ? (
            <FontAwesomeIcon icon={faCircleNotch} className="text-xs animate-spin" />
          ) : permissionState === 'denied' ? (
            <FontAwesomeIcon icon={faTriangleExclamation} className="text-xs" />
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

  // Full Button with optional Test Trigger
  return (
    <div className="relative inline-flex flex-col items-start gap-1.5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleToggle}
          disabled={loading}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
            isSubscribed
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
              : permissionState === 'denied'
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
              : 'bg-[var(--card)] hover:bg-[var(--bg)] text-[var(--text)] border-[var(--border)]'
          } ${className}`}
        >
          {loading ? (
            <FontAwesomeIcon icon={faCircleNotch} className="text-xs animate-spin text-[var(--olive)]" />
          ) : isSubscribed ? (
            <FontAwesomeIcon icon={faCheck} className="text-xs text-emerald-600 dark:text-emerald-400" />
          ) : (
            <FontAwesomeIcon icon={faBell} className="text-xs text-[var(--olive)]" />
          )}
          <span>
            {isSubscribed
              ? 'Notifications Active'
              : permissionState === 'denied'
              ? 'Notifications Blocked'
              : 'Enable Notifications'}
          </span>
        </button>

        {(showTestButton || isSubscribed) && (
          <button
            type="button"
            onClick={handleTestNotification}
            disabled={testLoading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--bg)] text-[var(--text)] transition-colors cursor-pointer disabled:opacity-60"
            title="Test push notification and audio chime"
          >
            {testLoading ? (
              <FontAwesomeIcon icon={faCircleNotch} className="text-[10px] animate-spin text-[var(--olive)]" />
            ) : (
              <FontAwesomeIcon icon={faVolumeHigh} className="text-[10px] text-[var(--olive)]" />
            )}
            <span>{testLoading ? 'Testing...' : 'Test Alert'}</span>
          </button>
        )}
      </div>

      {feedback && (
        <div
          className={`mt-1 px-3 py-1 rounded-md text-[11px] font-medium border shadow-xs animate-in fade-in duration-150 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200'
              : feedback.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/70 dark:text-rose-200'
              : 'bg-[var(--card)] border-[var(--border)] text-[var(--text)]'
          }`}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
}

