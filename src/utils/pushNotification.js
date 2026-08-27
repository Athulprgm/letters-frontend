import { apiUrl } from '@/src/config/api';

export const DEFAULT_VAPID_PUBLIC_KEY =
  'BCBL-EMJVJenDSYVukBAUIcB3XC7ebxPGdfh5F5untU4v1VexvD2BnY5kgnzj9LcbvHjjhz7Fg1ycYa8yMbsyMo';

/**
 * Convert a URL-safe Base64 string to a Uint8Array for PushManager subscription.
 */
export function urlBase64ToUint8Array(base64String) {
  if (!base64String) return new Uint8Array(0);
  const cleanStr = base64String.trim();
  const padding = '='.repeat((4 - (cleanStr.length % 4)) % 4);
  const base64 = (cleanStr + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if the browser supports Web Push, Notifications, and Service Workers.
 */
export function isPushSupported() {
  if (typeof window === 'undefined') return false;
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Get the current notification permission state ('granted' | 'denied' | 'default' | 'unsupported').
 */
export function getNotificationPermissionState() {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Register or get the active Service Worker registration.
 */
export async function registerServiceWorker() {
  if (!isPushSupported()) {
    throw new Error('Web Push Notifications are not supported in this browser.');
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    await navigator.serviceWorker.ready;
    return registration;
  } catch (err) {
    console.error('Service Worker registration error:', err);
    throw new Error('Failed to initialize Service Worker. Ensure /sw.js is accessible.');
  }
}

/**
 * Get the existing browser push subscription if any.
 */
export async function getExistingPushSubscription() {
  if (!isPushSupported()) return null;
  try {
    const registration = await registerServiceWorker();
    return await registration.pushManager.getSubscription();
  } catch (err) {
    console.warn('Failed to retrieve existing push subscription:', err);
    return null;
  }
}

/**
 * Audio Context singleton for luxury bell chime notifications.
 */
let sharedAudioContext = null;

export function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      sharedAudioContext = new AudioCtx();
    }
  }
  return sharedAudioContext;
}

/**
 * Unlocks AudioContext on user interaction so subsequent order alerts play seamlessly.
 */
export function unlockAudioContext() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
}

if (typeof window !== 'undefined') {
  const unlockEvents = ['click', 'touchstart', 'keydown'];
  const handleFirstInteraction = () => {
    unlockAudioContext();
    unlockEvents.forEach((evt) => window.removeEventListener(evt, handleFirstInteraction));
  };
  unlockEvents.forEach((evt) => window.addEventListener(evt, handleFirstInteraction, { passive: true }));
}

/**
 * Synthesize and play a pleasant, luxury bell chime using Web Audio API.
 * Works 100% offline with zero external audio assets required.
 */
export function playNotificationSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // First Bell Tone (High G5 / 784Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(783.99, now);
    osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 0.08); // Glide to C6

    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.35, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.45);

    // Second Resonant Tone (C6 / 1046.50Hz harmonic chime)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1046.50, now + 0.12);
    osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.25); // E6

    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.4, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.9);
  } catch (err) {
    console.warn('Audio chime playback failed:', err);
  }
}

/**
 * Display a direct in-browser Notification (Desktop / Mobile popup).
 */
export async function showLocalNotification(title, options = {}) {
  if (!isPushSupported()) return;

  try {
    if (Notification.permission !== 'granted') {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return;
    }

    const defaultOptions = {
      body: 'You have a new update from LETTERS Atelier.',
      icon: '/logo.png',
      badge: '/logo.png',
      vibrate: [200, 100, 200],
      tag: `local-alert-${Date.now()}`,
      ...options,
    };

    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(title, defaultOptions);
          return;
        }
      } catch (e) {}
    }

    new Notification(title, defaultOptions);
  } catch (e) {
    console.warn('showLocalNotification failed:', e);
  }
}

/**
 * Subscribe the current browser to Web Push notifications.
 *
 * @param {Object} options
 * @param {'admin'|'user'} [options.role='user']
 * @param {string|null} [options.userId=null]
 * @returns {Promise<{success: boolean, subscription: PushSubscription}>}
 */
export async function subscribeToPushNotifications({ role = 'user', userId = null } = {}) {
  if (!isPushSupported()) {
    throw new Error('Web Push notifications are not supported by your browser.');
  }

  // 1. Request notification permission from user
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error(
      permission === 'denied'
        ? 'Notification permission was denied. Please allow notifications in your browser address bar.'
        : 'Notification permission prompt was dismissed.'
    );
  }

  // 2. Register Service Worker
  const registration = await registerServiceWorker();

  // 3. Obtain VAPID Public Key from environment or default
  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC_KEY;
  const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

  // 4. Retrieve or create subscription
  let subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    try {
      // Refresh subscription to ensure active binding
      await subscription.unsubscribe();
      subscription = null;
    } catch (e) {
      console.warn('Could not reset previous push subscription:', e);
    }
  }

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
  }

  const subJson = subscription.toJSON();

  // 5. Send subscription to Laravel backend
  const payload = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subJson.keys?.p256dh || '',
      auth: subJson.keys?.auth || '',
    },
    role,
    user_id: userId || (role === 'admin' ? 'admin' : null),
  };

  const res = await fetch(apiUrl('/api/push/subscribe'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to register push subscription on server.');
  }

  try {
    localStorage.setItem('letters_push_subscribed', 'true');
    localStorage.setItem('letters_push_endpoint', subscription.endpoint);
    localStorage.setItem('letters_push_role', role);
  } catch (e) {}

  // Play chime confirmation
  playNotificationSound();

  return { success: true, subscription };
}

/**
 * Unsubscribe current browser from Web Push notifications.
 */
export async function unsubscribeFromPushNotifications() {
  if (!isPushSupported()) return { success: false };

  try {
    const registration = await registerServiceWorker();
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      // Notify backend to remove subscription record
      await fetch(apiUrl('/api/push/unsubscribe'), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ endpoint }),
      }).catch((e) => console.warn('Unsubscribe API call failed:', e));
    }

    localStorage.removeItem('letters_push_subscribed');
    localStorage.removeItem('letters_push_endpoint');
    localStorage.removeItem('letters_push_role');

    return { success: true };
  } catch (err) {
    console.error('Error during unsubscribe:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Trigger a Test Push Notification via backend.
 */
export async function sendTestPushNotification({ role = 'admin', userId = null } = {}) {
  const endpoint = typeof window !== 'undefined' ? localStorage.getItem('letters_push_endpoint') : null;

  // 1. Play sound chime locally
  playNotificationSound();

  // 2. Call backend test endpoint
  const res = await fetch(apiUrl('/api/push/test'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      role,
      user_id: userId,
      endpoint,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Failed to dispatch test notification.');
  }

  // 3. Also show a local fallback notification if permission is granted
  if (Notification.permission === 'granted') {
    showLocalNotification('🔔 Test Notification Delivered', {
      body: 'Web Push and Audio chime are working perfectly on LETTERS Atelier!',
      data: { url: role === 'admin' ? '/admin/orders' : '/' },
    });
  }

  return data;
}

/**
 * Listen for messages sent from the Service Worker when a push is received.
 */
export function setupNotificationListeners(onMessageCallback) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return () => {};
  }

  const handler = (event) => {
    if (event.data && event.data.type === 'PUSH_NOTIFICATION_RECEIVED') {
      playNotificationSound();
      if (typeof onMessageCallback === 'function') {
        onMessageCallback(event.data);
      }
    }
  };

  navigator.serviceWorker.addEventListener('message', handler);
  return () => {
    navigator.serviceWorker.removeEventListener('message', handler);
  };
}

/**
 * Get push system statistics from backend.
 */
export async function fetchPushStatus() {
  try {
    const res = await fetch(apiUrl('/api/push/status'));
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Failed to fetch push status:', e);
  }
  return { success: false };
}

